import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '../interceptors';
import { MediaService } from '../services';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    return await this.mediaService.upload(file);
  }

  // upload multi file
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files'))
  async uploads(@UploadedFiles() files) {
    const medias = [];
    for (const item of files) {
      medias.push(await this.mediaService.upload(item));
    }
    return medias;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const url = await this.mediaService.getLinkFile(id);
    return {
      url: url,
    };
  }

  @Patch(':id/update-acl')
  async updateACL(@Param('id') id: string) {
    return this.mediaService.updateACL(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.mediaService.deleteFileS3(id);
    return true;
  }
}
