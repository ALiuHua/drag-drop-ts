class State {
  listeners = [];
  state = [];
  addState(data) {
    this.state.push(data);
    //执行传递进来的listener
    for (const listener of this.listeners) {
      listener(this.state.slice());
    }
  }
  addListener(fn) {
    this.listeners.push(fn);
  }
}

class User {
  assignedState = [];
  name;
  constructor(name) {
    state.addListener((state) => {
      this.assignedState = state;
      //这里的this为什么指向实例化的user？
      this.name = name;
      console.log(this);
    });
  }
}

const state = new State();
const user = new User("andy");
state.addState("newData");

/**
 * // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 箭头函数的this指向问题：引入箭头函数有两个方面的作用：更简短的函数并且不绑定this。
 在箭头函数出现之前，每一个新函数根据它是被如何调用的来定义这个函数的 this 值：
 如果该函数是一个构造函数，this 指针指向一个新的对象
 在严格模式下的函数调用下，this 指向undefined
 如果该函数是一个对象的方法，则它的 this 指针指向这个对象
 等等


 箭头函数不会创建自己的this，它只会从自己的作用域链的上一层继承 this。因此，在下面的代码中，
 传递给setInterval的函数内的this与封闭函数中的this值相同：
 function Person(){
  this.age = 0;

  setInterval(() => {
        this.age++; // |this| 正确地指向 p 实例
    }, 1000);
  }

  var p = new Person();



  总结：
  1. 箭头函数没有this， this是从父级词法环境下（定义的位置，而非调用的位置）继承过来的。
  继承的是父级被调用时的this值
  2. 如下例子
    let group = {
      title: "Our Group",
      students: ["John", "Pete", "Alice"],

      showList() {
        this.students.forEach(
        student => alert(this.title + ': ' + student) 
        );
    //这里是forEach方法调用，里面传入了箭头函数； 注意：这里传入的箭头函数的所属词法环境是showList函数，而非forEach方法
      }
    };
    group.showList();
    所以解释了最上面User class中调用addListener方法时传入的箭头函数的listenter的词法环境是constructor；constructor被调用时
    this指向new出的对象；所以箭头函数中的this指向User的实例对象；
   3. new > 显式绑定 > 隐式绑定 > 默认绑定






   //https://juejin.cn/post/7152203741322543111
   //https://zh.javascript.info/arrow-functions
   // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions

 */

function Pet(name) {
  this.name = name;

  this.getName = () => this.name;
}

const cat = new Pet("Fluffy");

console.log(cat.getName()); // 会打印什么？

const { getName } = cat;

console.log(getName()); // 会打印什么?
const newFn = getName;
const newObj = { name: "Andy", get: newFn };
console.log(newObj.get());
