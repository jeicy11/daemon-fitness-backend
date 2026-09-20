import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guards';

@ApiTags('Equipamiento')
@ApiBearerAuth()
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @ApiOperation({ summary: 'Lista el equipamiento activo' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.productoService.findAll();
  }

  @ApiOperation({ summary: 'Lista equipamiento con stock igual o menor al umbral' })
  @UseGuards(JwtAuthGuard)
  @Get('stock-bajo')
  findStockBajo(@Query('umbral') umbral?: string) {
    return this.productoService.findStockBajo(umbral ? Number(umbral) : 5);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productoService.findOne(id);
  }

  @ApiOperation({ summary: 'Registra un nuevo equipo (Administrador o Supervisor)' })
  @Roles('Administrador', 'Supervisor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  @Roles('Administrador', 'Supervisor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) {
    return this.productoService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminación lógica de un equipo' })
  @Roles('Administrador', 'Supervisor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productoService.remove(id);
  }
}