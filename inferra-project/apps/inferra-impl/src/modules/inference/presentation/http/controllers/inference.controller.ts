import { Body, Controller, Get, Headers, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import { ApiKeysService } from "../../../../api-credentials/application/services/api-keys.service";
import { InferenceService } from "../../../application/services/inference.service";
import {
  type ChatCompletionRequestDto,
  chatCompletionRequestDto,
} from "../dto/chat-completion.request.dto";
import {
  type CompletionRequestDto,
  completionRequestDto,
  type EmbeddingsRequestDto,
  embeddingsRequestDto,
} from "../dto/completion.request.dto";
@Controller("v1")
export class InferenceController {
  constructor(
    private readonly keys: ApiKeysService,
    private readonly service: InferenceService,
  ) {}
  @Get("models") async listServingModels(
    @Headers("authorization") authorization?: string,
  ) {
    const principal = await this.keys.authenticateKey(authorization);
    return this.service.listServingModels(principal.organization_id);
  }
  @Post("chat/completions") async createChatCompletion(
    @Headers("authorization") authorization: string | undefined,
    @Body(new ZodPipe(chatCompletionRequestDto))
    input: ChatCompletionRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const principal = await this.keys.authenticateKey(authorization);
    return this.service.createChatCompletion(
      principal.organization_id,
      input,
      req,
      res,
    );
  }
  @Post("completions") async createCompletion(
    @Headers("authorization") authorization: string | undefined,
    @Body(new ZodPipe(completionRequestDto)) input: CompletionRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const principal = await this.keys.authenticateKey(authorization);
    return this.service.createCompletion(
      principal.organization_id,
      input,
      req,
      res,
    );
  }
  @Post("embeddings") async createEmbeddings(
    @Headers("authorization") authorization: string | undefined,
    @Body(new ZodPipe(embeddingsRequestDto)) input: EmbeddingsRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const principal = await this.keys.authenticateKey(authorization);
    return this.service.createEmbeddings(
      principal.organization_id,
      input,
      req,
      res,
    );
  }
}
