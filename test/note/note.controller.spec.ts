import { Test, TestingModule } from '@nestjs/testing';
import { NoteController } from '../../src/modules/note/note.controller';
import { NoteService } from '../../src/modules/note/note.service';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { CreateNoteDto } from '../../src/modules/note/dto/create-note.dto';
import { Note } from '../../src/modules/note/entities/note.entity';

describe('NoteController', () => {
    let controller: NoteController;
    let mockNoteService: Partial<NoteService>;

    beforeEach(async () => {
        mockNoteService = {
            create: jest.fn(dto => {
                return Promise.resolve({
                    id: 'uuid-generated-id',
                    note: dto.note,
                    createdAt: new Date(),
                } as Note);
            }),
            findAll: jest.fn(() => {
                return Promise.resolve([{ id: 'uuid-generated-id', createdAt: new Date() }]);
            }),
            findOne: jest.fn(id => {
                if (id === 'uuid-generated-id') {
                    return Promise.resolve({ id, note: 'decrypted note', createdAt: new Date() });
                }
                return Promise.reject(new NotFoundException('Note not found'));
            }),
            findEncryptedOne: jest.fn(id => {
                if (id === 'uuid-generated-id') {
                    return Promise.resolve({ id, note: 'encrypted note', createdAt: new Date() });
                }
                return Promise.reject(new NotFoundException('Note not found'));
            }),
            update: jest.fn((id, dto) => {
                if (id === 'uuid-generated-id') {
                    return Promise.resolve({ id, note: dto.note, createdAt: new Date() });
                }
                return Promise.reject(new NotFoundException('Note not found'));
            }),
            remove: jest.fn(id => {
                if (id !== 'uuid-generated-id') {
                    return Promise.reject(new NotFoundException('Note not found'));
                }
                return Promise.resolve();
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NoteController],
            providers: [
                {
                    provide: NoteService,
                    useValue: mockNoteService,
                },
            ],
        }).compile();

        controller = module.get<NoteController>(NoteController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new note and return that', async () => {
            const dto = { note: 'This is a secret note' };
            expect(await controller.create(dto)).toEqual({
                id: 'uuid-generated-id',
                note: dto.note,
                createdAt: expect.any(Date),
            });
            expect(mockNoteService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('should return an array of notes', async () => {
            expect(await controller.findAll()).toEqual([
                { id: 'uuid-generated-id', createdAt: expect.any(Date) }
            ]);
            expect(mockNoteService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single note', async () => {
            expect(await controller.findOne('uuid-generated-id')).toEqual({
                id: 'uuid-generated-id',
                note: 'decrypted note',
                createdAt: expect.any(Date)
            });
        });

        it('should throw an error if note not found', async () => {
            await expect(controller.findOne('non-existent-id'))
                .rejects.toThrow(new NotFoundException('Note not found'));
        });
    });



});
