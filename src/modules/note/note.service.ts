import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NoteService {
    constructor(
        @InjectRepository(Note) private noteRepository: Repository<Note>,
        private encryptionService: EncryptionService
    ) {}

    async create(createNoteDto: CreateNoteDto): Promise<Note> {
        const encryptedNote: string = this.encryptionService.encrypt(createNoteDto.note);
        const note: Note = this.noteRepository.create({ note: encryptedNote });
        return this.noteRepository.save(note);
    }

    async findAll(): Promise<Partial<Note>[]> {
        return this.noteRepository.find({
            select: ['id', 'createdAt']
        });
    }

    async findOne(id: string): Promise<Note> {
        const note = await this.noteRepository.findOne({
            where: { id: id },
            select: ['id', 'note', 'createdAt']
        });
        if (!note) {
            throw new NotFoundException(`Note with ID ${id} not found`);
        }
        note.note = this.encryptionService.decrypt(note.note);
        return note;
    }

    async findEncryptedOne(id: string): Promise<Note> {
        const note = await this.noteRepository.findOne({
            where: { id: id },
            select: ['id', 'note', 'createdAt']
        });
        if (!note) {
            throw new NotFoundException(`Note with ID ${id} not found`);
        }
        return note;
    }

    async update(id: string, createNoteDto: CreateNoteDto): Promise<Note> {
        const existingNote = await this.noteRepository.findOne({
            where: { id: id }
        });
        if (!existingNote) {
            throw new NotFoundException(`Note with ID ${id} not found`);
        }
        existingNote.note = this.encryptionService.encrypt(createNoteDto.note);
        return this.noteRepository.save(existingNote);
    }

    async remove(id: string): Promise<void> {
        const result = await this.noteRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Note with ID ${id} not found`);
        }
    }
}
