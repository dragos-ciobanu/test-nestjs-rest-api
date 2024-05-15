import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NoteController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('POST /notes', async () => {
        const noteDto = { note: 'This is a test note' };
        await request(app.getHttpServer())
            .post('/notes')
            .send(noteDto)
            .expect(201)
            .expect(response => {
                expect(response.body.id).toBeDefined();
            });
    });

    it('GET /notes', async () => {
        await request(app.getHttpServer())
            .get('/notes')
            .expect(200)
            .expect(response => {
                expect(Array.isArray(response.body)).toBeTruthy();
            });
    });

    it('GET /notes/:id', async () => {
        const postResponse = await request(app.getHttpServer())
            .post('/notes')
            .send({ note: 'Another test note' });

        const noteId = postResponse.body.id;
        await request(app.getHttpServer())
            .get(`/notes/${noteId}`)
            .expect(200)
            .expect(response => {
                expect(response.body.note).toEqual('Another test note');
            });
    });

    it('GET /notes/encrypted/:id', async () => {
        const postResponse = await request(app.getHttpServer())
            .post('/notes')
            .send({ note: 'Encrypted test note' });

        const noteId = postResponse.body.id;
        await request(app.getHttpServer())
            .get(`/notes/encrypted/${noteId}`)
            .expect(200)
            .expect(response => {
                expect(response.body.note).toBeDefined();
            });
    });

    it('PUT /notes/:id', async () => {
        const postResponse = await request(app.getHttpServer())
            .post('/notes')
            .send({ note: 'Initial test note' });

        const noteId = postResponse.body.id;
        await request(app.getHttpServer())
            .put(`/notes/${noteId}`)
            .send({ note: 'Updated test note' })
            .expect(200)
            .expect(response => {
                expect(response.body.note).not.toEqual(postResponse.body.note);
            });
    });

    it('DELETE /notes/:id', async () => {
        const postResponse = await request(app.getHttpServer())
            .post('/notes')
            .send({ note: 'Note to delete' });

        const noteId = postResponse.body.id;
        await request(app.getHttpServer())
            .delete(`/notes/${noteId}`)
            .expect(200);
    });
});
