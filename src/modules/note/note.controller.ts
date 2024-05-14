import { Controller, Post, Get, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';

@Controller('notes')
export class NoteController {
    constructor(private readonly noteService: NoteService) {}

    @Get()
    findAll(): Promise<Partial<Note>[]> {
        return this.noteService.findAll();
    }

    @Post()
    create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
        return this.noteService.create(createNoteDto).catch((e) => {
            throw new HttpException('Failed to create note' + e, HttpStatus.INTERNAL_SERVER_ERROR);
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Note> {
        return this.noteService.findOne(id).catch(() => {
            throw new HttpException('Note not found', HttpStatus.NOT_FOUND);
        });
    }

    @Get('encrypted/:id')
    findEncryptedOne(@Param('id') id: string): Promise<Note> {
        return this.noteService.findEncryptedOne(id).catch(() => {
            throw new HttpException('Encrypted note not found', HttpStatus.NOT_FOUND);
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() createNoteDto: CreateNoteDto): Promise<Note> {
        return this.noteService.update(id, createNoteDto).catch(() => {
            throw new HttpException('Failed to update note', HttpStatus.NOT_FOUND);
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.noteService.remove(id).catch(() => {
            throw new HttpException('Failed to delete note', HttpStatus.NOT_FOUND);
        });
    }
}
