declare module '@prisma/client' {
  // Minimal shim for environments without generated Prisma client
  export class PrismaClient {
    constructor(...args: any[]);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    [key: string]: any;
  }

  export type Review = any;
  export type Repos = any;
  export type PR = any;
  export const Prisma: any;
}
