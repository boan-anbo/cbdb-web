import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { APP_DB_CONNECTION } from '../db/db.module';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock database methods
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: APP_DB_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockDb.returning.mockResolvedValue([mockUser]);

      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockDb.from.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockDb.where.mockResolvedValue([mockUser]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockDb.returning.mockResolvedValue([updatedUser]);

      const updateUserDto = { name: 'Updated Name' };
      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockDb.returning.mockResolvedValue([mockUser]);

      const result = await service.remove(1);

      expect(result).toEqual(mockUser);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});