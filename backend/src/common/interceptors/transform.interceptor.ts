import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { success: boolean; data: T }> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<{ success: boolean; data: T }> {
    return next.handle().pipe(map((data: T) => ({ success: true, data })));
  }
}
