import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { APP_DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(APP_DB_CONNECTION)
    private db: LibSQLDatabase<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password, // In production, hash this password!
      })
      .returning();

    return newUser;
  }

  async findAll() {
    return await this.db.select().from(schema.users);
  }

  async findOne(id: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const [updatedUser] = await this.db
      .update(schema.users)
      .set({
        ...updateUserDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: number) {
    const [deletedUser] = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return deletedUser;
  }
}