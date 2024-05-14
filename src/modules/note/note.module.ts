import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Note } from './entities/note.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
    imports: [TypeOrmModule.forFeature([Note])],
    controllers: [NoteController],
    providers: [NoteService, EncryptionService],
})
export class NoteModule {}
