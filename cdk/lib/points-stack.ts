import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as sns from "aws-cdk-lib/aws-sns";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import { TypeScriptLambda } from "./constructs/lambda";
import { SqsEventSource, SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

import "dotenv/config";

export class PointsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "Points-StacksBlocks-Queue", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(300), // How long a consumer has to process a message
      retentionPeriod: cdk.Duration.days(14), // How long message are kept in memory
      deadLetterQueue: {
        maxReceiveCount: 3, // Maximum number of receives before moving the message to the DLQ
        queue: new sqs.Queue(this, "Points-StacksBlocks-DLQ", { fifo: true }),
      },
    });

    const wallet_updates_topic = new sns.Topic(this, "Points-WalletUpdates-Topic");

    const vpc = new ec2.Vpc(this, "Points-VPC", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const cluster = new ecs.Cluster(this, "Points-Cluster", { vpc });
    cluster.addCapacity("Points-ASG", {
      instanceType: new ec2.InstanceType("t2.small"),
      desiredCapacity: 1,
    });

    const stacks_listener = new ecsPatterns.ApplicationLoadBalancedEc2Service(this, "SDAO-StacksListener-Service", {
      cluster,
      memoryReservationMiB: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("."),
        containerPort: 3000,
        environment: {
          QUEUE_URL: queue.queueUrl,
        },
      },
      desiredCount: 1, // Number of instances to run
      healthCheckGracePeriod: cdk.Duration.seconds(60), // Grace period before health checks start
      circuitBreaker: { enable: true, rollback: true },
    });

    // Configure health check settings
    stacks_listener.targetGroup.configureHealthCheck({
      path: "/health", // Health check endpoint
      interval: cdk.Duration.seconds(30), // Health check interval
      timeout: cdk.Duration.seconds(5), // Timeout for health checks
      healthyThresholdCount: 2, // Number of consecutive successful health checks required
      unhealthyThresholdCount: 2, // Number of consecutive failed health checks required to mark as unhealthy
    });

    const wallet_tracker = new TypeScriptLambda(this, "Points-WalletTracker", {
      lambdaRootDir: ".",
      handlerFilePath: "apps/functions/src/wallet-tracker.ts",
      handler: "updateWallets",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        OUTGOING_SNS_TOPIC: wallet_updates_topic.topicArn,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS!,
      },
    });

    wallet_tracker.lambda.addEventSource(new SqsEventSource(queue));

    const leaderboard = new TypeScriptLambda(this, "Points-Leaderboard", {
      lambdaRootDir: ".",
      handlerFilePath: "apps/functions/src/leaderboard.ts",
      handler: "updateLeaderboard",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    });

    leaderboard.lambda.addEventSource(new SnsEventSource(wallet_updates_topic));

    const daily_points = new TypeScriptLambda(this, "Points-DailyPointsUpdater", {
      lambdaRootDir: ".",
      handlerFilePath: "apps/functions/src/daily-points.ts",
      handler: "updateDailyPoints",
      timeout: cdk.Duration.minutes(15),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS!,
      },
    });

    const dailyEvent = new events.Rule(this, "scheduleRule", {
      schedule: events.Schedule.cron({ minute: "0", hour: "0" }),
      targets: [new targets.LambdaFunction(daily_points.lambda)],
    });

    new cdk.CfnOutput(this, "WalletTrackeFnrARN", { value: wallet_tracker.lambda.functionArn });
    new cdk.CfnOutput(this, "LeaderboaordFnARN", { value: leaderboard.lambda.functionArn });
    new cdk.CfnOutput(this, "DailyPointsFnARN", { value: daily_points.lambda.functionArn });
    new cdk.CfnOutput(this, "DailyPointsEventARN", { value: dailyEvent.ruleArn });
    new cdk.CfnOutput(this, "WalletUpdatesTopicARN", { value: wallet_updates_topic.topicArn });
    new cdk.CfnOutput(this, "StacksBlocksQueueARN", { value: queue.queueArn });
  }
}
