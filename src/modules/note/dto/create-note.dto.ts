import {ApiProperty} from "@nestjs/swagger";

export class CreateNoteDto {
    @ApiProperty()
    note: string;
}