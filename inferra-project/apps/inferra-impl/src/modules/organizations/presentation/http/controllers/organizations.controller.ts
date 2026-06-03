import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { OrganizationsService } from "../../../application/services/organizations.service";
import {
  type AddMemberRequestDto,
  addMemberRequestDto,
  type SetMemberRoleRequestDto,
  setMemberRoleRequestDto,
} from "../dto/members.request.dto";
import {
  type RegisterOrganizationRequestDto,
  registerOrganizationRequestDto,
} from "../dto/register-organization.request.dto";
import {
  type UpdateOrganizationRequestDto,
  updateOrganizationRequestDto,
} from "../dto/update-organization.request.dto";
@Controller("api/v1/organizations")
@UseGuards(IdentityGuard)
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}
  @Get() listMyOrganizations(@Req() req: SessionRequest) {
    return this.service.listMyOrganizations(req.identity!.id);
  }
  @Post() registerOrganization(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(registerOrganizationRequestDto))
    input: RegisterOrganizationRequestDto,
  ) {
    return this.service.registerOrganization(req.identity!.id, input);
  }
  @Get(":organization_id") getOrganization(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getOrganization(req.identity!.id, id);
  }
  @Get(":organization_id/members") listMembers(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.listMembers(req.identity!.id, id);
  }
  @Post(":organization_id/members") addMember(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(addMemberRequestDto)) input: AddMemberRequestDto,
  ) {
    return this.service.addMember(
      req.identity!.id,
      org,
      input.email,
      input.role,
    );
  }
  @Patch(":organization_id/members/:user_id") updateMemberRole(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("user_id", ParseUUIDPipe) user: string,
    @Body(new ZodPipe(setMemberRoleRequestDto)) input: SetMemberRoleRequestDto,
  ) {
    return this.service.setMemberRole(req.identity!.id, org, user, input.role);
  }
  @Delete(":organization_id/members/:user_id") removeMember(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("user_id", ParseUUIDPipe) user: string,
  ) {
    return this.service.removeMember(req.identity!.id, org, user);
  }
  @Patch(":organization_id") updateOrganization(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(updateOrganizationRequestDto))
    input: UpdateOrganizationRequestDto,
  ) {
    return this.service.updateOrganization(req.identity!.id, org, input.name);
  }
}
