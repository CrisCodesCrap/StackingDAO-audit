import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";

export class PointsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "Points-StacksBlocks-Queue", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(300), // How long a consumer has to process a message
      retentionPeriod: cdk.Duration.days(14), // How long message are kept in memory
      deadLetterQueue: {
        maxReceiveCount: 5, // Maximum number of receives before moving the message to the DLQ
        queue: new sqs.Queue(this, "Points-StacksBlocks-DLQ"),
      },
    });

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
      instanceType: new ec2.InstanceType("t2.micro"),
      desiredCapacity: 1,
    });

    const stacks_listener = new ecsPatterns.ApplicationLoadBalancedEc2Service(this, "SDAO-StacksListener-Service", {
      cluster,
      memoryLimitMiB: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("."), //.fromRegistry("nginxdemos/hello"),
        containerPort: 3000,
        environment: {
          QUEUE_URL: queue.queueUrl,
        },
      },
      desiredCount: 1, // Number of instances to run
      listenerPort: 80, // Port to expose your service
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
  }
}
