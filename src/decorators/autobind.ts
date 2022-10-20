//Auto-bind decorator
//对method的属性读取method函数变成get函数返回绑定this值的函数
//如果方法装饰器返回一个值，则该值作为被装饰的方法的修饰符

export function autobindDecorator(
  _: any,
  _2: string | Symbol,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    enumerable: true,
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}
