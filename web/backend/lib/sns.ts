import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export const snsClient = new SNSClient({ region: 'eu-west-1' });

export async function publish(topic: string, message: string) {
  return await snsClient.send(
    new PublishCommand({
      Message: message,
      TopicArn: topic,
    })
  );
}
