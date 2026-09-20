import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { VerificarClaveDto } from './dto/verificar-clave.dto';
import { evaluarFortalezaClave } from '../common/password-strength.util';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guards';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @ApiOperation({ summary: 'Clasifica una contraseña como débil, intermedia o fuerte' })
  @Post('verificar-clave')
  verificarClave(@Body() dto: VerificarClaveDto) {
    return { fortaleza: evaluarFortalezaClave(dto.clave) };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crea un usuario del sistema (solo Administrador)' })
  @Roles('Administrador')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista los usuarios activos' })
  @Roles('Administrador', 'Supervisor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @ApiBearerAuth()
  @Roles('Administrador', 'Supervisor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles('Administrador')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Elimina lógicamente un usuario (activo = false)' })
  @Roles('Administrador')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }
}