import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { DefaultAzureCredential } from '@azure/identity';
import {
  CognitiveServicesManagementClient,
  Deployment,
} from '@azure/arm-cognitiveservices';

@Controller('models')
export class ModelsController {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  async getModels() {
    try {
      const subscriptionId = '7f3b4174-82fe-4e56-90b2-510f6be40c99';
      const resourceGroupName = 'rg-jacobjohnson-2720_ai';
      const accountName = 'ai-jacobjohnson6839ai737967976461';
      const credential = new DefaultAzureCredential();
      const client = new CognitiveServicesManagementClient(
        credential,
        subscriptionId,
      );
      const resArray: Deployment[] = [];
      for await (const item of client.deployments.list(
        resourceGroupName,
        accountName,
      )) {
        resArray.push(item);
      }

      return resArray;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return new Response(error.message, { status: 500 });
      } else {
        return new Response('An unknown error occurred', { status: 500 });
      }
    }
  }

  // @Get()
  // async getModels() {
  //   try {
  //     //   const client = ModelClient(
  //     //     `https://${this.configService.get('AZURE_RESOURCE_NAME')}.services.ai.azure.com/models`,
  //     //     new AzureKeyCredential(this.configService.get('AZURE_API_KEY') || ''),
  //     //   );
  //     //   const response = await client.path('/info').get();

  //     //   return response;
  //     const { data } = await firstValueFrom(
  //       this.httpService
  //         .get(
  //           `https://${this.configService.get('AZURE_RESOURCE_NAME')}.openai.azure.com/openai/models?api-version=2023-05-15`,
  //           {
  //             headers: {
  //               'api-key': this.configService.get('AZURE_API_KEY') || '',
  //             },
  //           },
  //         )
  //         .pipe(
  //           catchError((error: AxiosError) => {
  //             console.log(error?.response?.data);
  //             throw new Error('An error happened!');
  //           }),
  //         ),
  //     );

  //     return data;
  //   } catch (error) {
  //     console.log(error);
  //     if (error instanceof Error) {
  //       return new Response(error.message, { status: 500 });
  //     } else {
  //       return new Response('An unknown error occurred', { status: 500 });
  //     }
  //   }
  // }
}
