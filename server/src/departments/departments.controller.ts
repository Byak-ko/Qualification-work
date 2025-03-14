import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getAllDepartments() {
    return this.departmentsService.findAll();
  }

  @Post()
  async createDepartment(@Body() body: { name: string; unitId: number }) {
    return this.departmentsService.create(body);
  }

  @Patch(':id')
  async updateDepartment(@Param('id') id: number, @Body() body: { name: string; unitId: number }) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  async deleteDepartment(@Param('id') id: number) {
    return this.departmentsService.delete(id);
  }
}
