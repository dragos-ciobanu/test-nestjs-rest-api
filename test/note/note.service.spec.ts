import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from '../../src/modules/note/note.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from '../../src/modules/note/entities/note.entity';
import { EncryptionService } from '../../src/modules/encryption/encryption.service';
import { Repository} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('NoteService', () => {
    let service: NoteService;
    let mockNoteRepository: Partial<Repository<Note>>;
    let mockEncryptionService: Partial<EncryptionService>;

    beforeEach(async () => {
        mockNoteRepository = {
            create: jest.fn().mockImplementation(dto => dto),
            save: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
            findOne: jest.fn().mockImplementation(() => Promise.resolve()),
            find: jest.fn().mockImplementation(() => Promise.resolve([])),
            delete: jest.fn().mockImplementation(() => Promise.resolve({ affected: 1 }))
        };

        mockEncryptionService = {
            encrypt: jest.fn().mockImplementation((text: string) => `encrypted-${text}`),
            decrypt: jest.fn().mockImplementation((text: string) => text.replace('encrypted-', ''))
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NoteService,
                {
                    provide: getRepositoryToken(Note),
                    useValue: mockNoteRepository
                },
                {
                    provide: EncryptionService,
                    useValue: mockEncryptionService
                }
            ],
        }).compile();

        service = module.get<NoteService>(NoteService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should encrypt the note and save it', async () => {
            const dto = { note: 'test note' };
            const result = await service.create(dto);
            expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('test note');
            expect(mockNoteRepository.save).toHaveBeenCalledWith({ note: 'encrypted-test note' });
            expect(result.note).toEqual('encrypted-test note');
        });
    });

    describe('findAll', () => {
        it('should return all notes', async () => {
            mockNoteRepository.find.mockImplementationOnce(() => Promise.resolve([{ id: '1', createdAt: new Date() }]));
            const notes = await service.findAll();
            expect(notes).toEqual([{ id: '1', createdAt: expect.any(Date) }]);
        });
    });

    describe('findOne', () => {
        it('should return a decrypted note if found', async () => {
            mockNoteRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: '1', note: 'encrypted-note', createdAt: new Date() }));
            const note = await service.findOne('1');
            expect(note.note).toEqual('note');
        });

        it('should throw NotFoundException if no note is found', async () => {
            mockNoteRepository.findOne.mockImplementationOnce(() => Promise.resolve(null));
            await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findEncryptedOne', () => {
        it('should return an encrypted note if found', async () => {
            mockNoteRepository.findOne.mockImplementationOnce(() => Promise.resolve({ id: '1', note: 'encrypted-note', createdAt: new Date() }));
            const note = await service.findEncryptedOne('1');
            expect(note.note).toEqual('encrypted-note');
        });

        it('should throw NotFoundException if no note is found', async () => {
            mockNoteRepository.findOne.mockImplementationOnce(() => Promise.resolve(null));
            await expect(service.findEncryptedOne('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should encrypt the updated note and save it', async () => {
            mockNoteRepository.findOne.mockResolvedValue(() => Promise.resolve({ id: '1', note: 'encrypted-note', createdAt: new Date() }));
            const dto = { note: 'updated note' };
            const updatedNote = await service.update('1', dto);
            expect(mockEncryptionService.encrypt).toHaveBeenCalledWith('updated note');
            expect(updatedNote.note).toEqual('encrypted-updated note');
        });

        it('should throw NotFoundException if no note is found', async () => {
            mockNoteRepository.findOne.mockResolvedValue(() => Promise.resolve(null));
            await expect(service.update('1', { note: 'updated note' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove the note if it exists', async () => {
            mockNoteRepository.delete.mockImplementationOnce(() => Promise.resolve({ affected: 1 }));
            await service.remove('1');
            expect(mockNoteRepository.delete).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if no note is found to delete', async () => {
            mockNoteRepository.delete.mockImplementationOnce(() => Promise.resolve({ affected: 0 }));
            await expect(service.remove('1')).rejects.toThrow(NotFoundException);
        });
    });
});
