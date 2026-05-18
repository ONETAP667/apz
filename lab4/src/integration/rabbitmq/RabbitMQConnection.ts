import amqplib, { Channel, ChannelModel } from "amqplib";
import { RabbitMQConfig } from "./RabbitMQConfig";

export class RabbitMQConnectionManager {
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly config: RabbitMQConfig) {}

  async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqplib.connect(this.config.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.config.exchange, "topic", { durable: true });
    return this.channel;
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = undefined;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = undefined;
    }
  }
}