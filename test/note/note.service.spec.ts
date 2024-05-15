import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from '../../src/modules/note/note.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from '../../src/modules/note/entities/note.entity';
import { EncryptionService } from '../../src/modules/encryption/encryption.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from '../../src/modules/note/dto/create-note.dto';

describe('NoteService', () => {
    let service: NoteService;
    let mockNoteRepository: Partial<Repository<Note>>;
    let mockEncryptionService: Partial<EncryptionService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NoteService,
                {
                    provide: getRepositoryToken(Note),
                    useValue: {
                        create: jest.fn().mockImplementation(dto => dto),
                        save: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
                        findOne: jest.fn().mockImplementation((query) => {
                            return Promise.resolve(query.where.id === '1' ? { id: '1', note: 'encrypted-note', createdAt: new Date() } : null);
                        }),
                        find: jest.fn().mockResolvedValue([{ id: '1', note: 'encrypted-note', createdAt: new Date() }]),
                        delete: jest.fn().mockImplementation(id => Promise.resolve({ affected: id === '1' ? 1 : 0 }))
                    }
                },
                {
                    provide: EncryptionService,
                    useValue: {
                        encrypt: jest.fn(text => `encrypted-${text}`),
                        decrypt: jest.fn(text => text.replace('encrypted-', ''))
                    }
                }
            ],
        }).compile();

        service = module.get<NoteService>(NoteService);
        mockNoteRepository = module.get(getRepositoryToken(Note));
        mockEncryptionService = module.get(EncryptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should encrypt the note and save it', async () => {
        const dto: CreateNoteDto = { note: 'test note' };
        const result = await service.create(dto);
        expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('test note');
        expect(mockNoteRepository.save).toHaveBeenCalledWith({ note: 'encrypted-test note' });
        expect(result.note).toEqual('encrypted-test note');
    });

    it('should return all notes', async () => {
        const notes = await service.findAll();
        expect(notes).toEqual([{ id: '1', note: 'encrypted-note', createdAt: expect.any(Date) }]);
    });


    it('should return a decrypted note if found', async () => {
        const note = await service.findOne('1');
        expect(mockEncryptionService.decrypt).toHaveBeenCalledWith('encrypted-note');
        expect(note.note).toEqual('note');
    });

    it('should throw NotFoundException if no note is found', async () => {
        await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
    });

    it('should update a note if it exists', async () => {
        const dto: CreateNoteDto = { note: 'updated note' };
        await service.update('1', dto);
        expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('updated note');
        expect(mockNoteRepository.save).toHaveBeenCalledWith({ id: '1', note: 'encrypted-updated note', createdAt: expect.any(Date) });
    });

    it('should throw NotFoundException if attempting to update a non-existent note', async () => {
        const dto: CreateNoteDto = { note: 'does not exist' };
        await expect(service.update('2', dto)).rejects.toThrow(NotFoundException);
    });

    it('should remove a note if it exists', async () => {
        await service.remove('1');
        expect(mockNoteRepository.delete).toHaveBeenCalledWith('1');
        expect(mockNoteRepository.delete).toHaveReturnedWith(Promise.resolve({ affected: 1 }));
    });

    it('should throw NotFoundException if no note is found to delete', async () => {
        await expect(service.remove('2')).rejects.toThrow(NotFoundException);
    });
});


