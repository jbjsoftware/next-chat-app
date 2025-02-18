import { Controller, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { createAzure } from '@ai-sdk/azure';
import { smoothStream, streamText } from 'ai';
import { ConfigService } from '@nestjs/config';

@Controller('chat')
export class ChatController {
  constructor(private configService: ConfigService) {}

  @Post()
  post(@Req() req, @Res() res: Response) {
    try {
      const { messages } = req.body;

      const azure = createAzure({
        resourceName: this.configService.get('AZURE_RESOURCE_NAME'), // Azure resource name
        apiKey: this.configService.get('AZURE_API_KEY'),
      });

      const result = streamText({
        model: azure('gpt-4'),
        system: 'You are a helpful assistant.',
        messages,
        experimental_transform: smoothStream(),
      });

      result.pipeDataStreamToResponse(res);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return new Response(error.message, { status: 500 });
      } else {
        return new Response('An unknown error occurred', { status: 500 });
      }
    }
  }
}
