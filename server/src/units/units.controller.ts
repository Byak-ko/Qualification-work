import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  async getAllUnits() {
    return this.unitsService.findAll();
  }

  @Post()
  async createUnit(@Body() body: { name: string; type: string }) {
    return this.unitsService.create(body);
  }

  @Patch(':id')
  async updateUnit(@Param('id') id: number, @Body() body: { name: string; type: string }) {
    return this.unitsService.update(id, body);
  }

  @Delete(':id')
  async deleteUnit(@Param('id') id: number) {
    return this.unitsService.delete(id);
  }
}
