import { afterAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { prisma } from '../lib/prisma'
const app=createApp()
afterAll(async()=>{await prisma.$disconnect()})
describe('API routes',()=>{
 it('allows public auth status in production',async()=>{const old=process.env.NODE_ENV;process.env.NODE_ENV='production';try{const r=await request(app).get('/api/auth/status');expect([200,503]).toContain(r.status)}finally{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old}})
 it('requires a PIN on protected production routes',async()=>{const old=process.env.NODE_ENV;process.env.NODE_ENV='production';try{const r=await request(app).get('/api/providers/health');expect(r.status).toBe(401);expect(r.body).toEqual({error:'UNAUTHORIZED',message:'PIN required'})}finally{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old}})
 it('returns health payload',async()=>{const r=await request(app).get('/health');expect(r.status).toBe(200);expect(r.body).toMatchObject({status:'ok'})})
 it('returns not found shape',async()=>{const r=await request(app).get('/not-a-route');expect(r.status).toBe(404);expect(r.body).toEqual({error:'NOT_FOUND',message:'Endpoint not found'})})
 it('validates character payload',async()=>{const r=await request(app).post('/api/characters').send({name:''});expect(r.status).toBe(400);expect(r.body.error).toBe('VALIDATION_ERROR')})
 it('validates memory payload',async()=>{const r=await request(app).post('/api/memories').send({content:''});expect(r.status).toBe(400);expect(r.body.error).toBe('VALIDATION_ERROR')})
 it('validates lorebook payload',async()=>{const r=await request(app).post('/api/lorebook').send({keywords:'',content:''});expect(r.status).toBe(400);expect(r.body.error).toBe('VALIDATION_ERROR')})
})
