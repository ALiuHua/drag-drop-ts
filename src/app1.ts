{
  //Alternative to render projects, without listeners!
  // we just need the identifier insead of actual value of them. so it's very good place to useing enum
  enum ProjectStatus {
    Active,
    Finished,
  }
  //Project type
  //In this case we dont want custom type or interface, because we want to instinanitail it
  // then we can use this class to new instance(之前是用字面量的形式，现在可以直接传入参数来new)
  type Listener = (items: Project[]) => void;

  class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public numOfPeople: number,
      public status: ProjectStatus
    ) {}
  }

  ///Project state management
  class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;
    private constructor() {}
    addListener(listenerFn: Listener) {
      this.listeners.push(listenerFn);
    }
    addProject(title: string, description: string, numOfPeople: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.Active
      );
      // const newProject = {id:Math.random().toString(),
      //   title,
      //   description,
      //   numOfPeople,
      //   status:ProjectStatus.Active};
      this.projects.push(newProject);
      //this = projectState
      for (const listenerFn of this.listeners) {
        console.log(this);
        listenerFn(this.projects.slice());
      }
    }
    static getInstance() {
      if (this.instance) return this.instance;
      this.instance = new ProjectState();
      return this.instance;
    }
  }
  //如何实现class间的数据交换
  const projectState = ProjectState.getInstance(); //this is a global variable instance, so we can use it within the entire file

  //ProjectList class
  class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];
    constructor(private type: "active" | "finished") {
      this.templateElement = document.getElementById(
        "project-list"
      )! as HTMLTemplateElement;
      this.hostElement = document.getElementById("app")! as HTMLDivElement;
      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      // importedNode is document frament, and which is live; once we append or insert will all or part it will update this frament anywhere
      /**
       * A common use for DocumentFragment is to create one, assemble a DOM subtree within it, then append or insert the fragment into the DOM using Node interface methods such as appendChild(), append(), or insertBefore(). Doing this moves the fragment's nodes into the DOM, leaving behind an empty DocumentFragment.
       This interface is also of great use with Web components: <template> elements contain a DocumentFragment in their HTMLTemplateElement.content property.
       */
      this.element = importedNode.firstElementChild! as HTMLElement;
      this.element.id = `${this.type}-projects`;
      this.assignedProjects = [];
      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((prj) => {
          if (this.type === "active") {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
      this.attach();
      this.renderContent();
    }
    private renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECT";
    }
    private renderProjects() {
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      //best sollutioin is doing dom comparision to deside which one already in the dom
      // in this small application, we just clear everything in each render, and rerender everything again
      listEl.innerHTML = "";

      for (const item of this.assignedProjects) {
        const listItem = document.createElement("li");
        listItem.innerHTML = item.title;
        listEl.appendChild(listItem);
      }
    }
    private attach() {
      this.hostElement.insertAdjacentElement("beforeend", this.element);
      // this.hostElement.insertAdjacentElement("beforeend", this.element);
      //即是我多次添加也只有一次，他是如何追踪的？ 这可能可以回答为什么我在attach后修改this.element.id仍然有效
    }
  }

  //Auto-bind decorator
  //对method的属性读取method函数变成get函数返回绑定this值的函数
  //如果方法装饰器返回一个值，则该值作为被装饰的方法的修饰符

  //Validation function
  //起名字，因为形容词
  interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }
  function validation(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
      isValid =
        isValid && validatableInput.value.toString().trim().length !== 0;
    }
    // value != null 或者 value ！= undefined 可以用来排除 value 为undefined 和 null的情况
    if (
      validatableInput.minLength != undefined &&
      typeof validatableInput.value === "string"
    ) {
      isValid =
        isValid &&
        validatableInput.value.trim().length >= validatableInput.minLength;
    }
    if (
      validatableInput.maxLength != undefined &&
      typeof validatableInput.value === "string"
    ) {
      isValid =
        isValid &&
        validatableInput.value.trim().length <= validatableInput.maxLength;
    }
    if (
      validatableInput.min != null &&
      typeof validatableInput.value === "number"
    ) {
      isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (
      validatableInput.max != null &&
      typeof validatableInput.value === "number"
    ) {
      isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
  }

  function autobindDecorator(
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

  class ProjectInput {
    private templateElement: HTMLTemplateElement;
    private hostElement: HTMLDivElement;

    titleInput: HTMLInputElement;
    peopleInput: HTMLInputElement;
    descriptionInput: HTMLInputElement;
    element: HTMLFormElement; // why we need this insead of using node directly? insertAdjacentElement 不接受node insert？
    constructor() {
      //DOM selection
      this.templateElement = document.getElementById(
        "project-input"
      )! as HTMLTemplateElement;
      this.hostElement = document.getElementById("app")! as HTMLDivElement;

      // Get the template content
      //这里的importNode是HTMLFragment
      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      //提取其中的element元素
      this.element = importedNode.firstElementChild as HTMLFormElement;
      //add id to the form to style it
      this.element.id = "user-input";
      //Form input element
      this.titleInput = this.element.querySelector(
        "#title"
      ) as HTMLInputElement;
      this.peopleInput = this.element.querySelector(
        "#people"
      ) as HTMLInputElement;
      this.descriptionInput = this.element.querySelector(
        "#description"
      ) as HTMLInputElement;

      this.configure();
      this.attach();
    }

    private getUserInput(): [string, string, number] | void {
      //return a tuple
      const enteredTitle = this.titleInput.value;
      const enteredDescription = this.descriptionInput.value;
      const enteredPeople = this.peopleInput.value;
      const validatableTitle: Validatable = {
        value: enteredTitle,
        required: true,
        minLength: 2,
        maxLength: 6,
      };
      const validatableDescription: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      };
      const validatablePeople: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 2,
        max: 6,
      };
      if (
        !validation(validatableTitle) ||
        !validation(validatableDescription) ||
        !validation(validatablePeople)
      ) {
        alert("Invalid input, please try again.");
        return;
      } else {
        return [enteredTitle, enteredDescription, +enteredPeople];
      }
    }

    private clearInputs() {
      this.titleInput.value = "";
      this.descriptionInput.value = "";
      this.peopleInput.value = "";
    }

    @autobindDecorator
    private submitHandler(e: Event) {
      e.preventDefault();
      const userInput = this.getUserInput();
      if (Array.isArray(userInput)) {
        const [title, desc, people] = userInput;
        projectState.addProject(title, desc, people);
        this.clearInputs();
      }
    }
    //attach event handler on the form,(如果我们表格内的按钮是type：submit， 则可以直接在form上设置submit listener，而不需要设置click event listener在按钮上)
    private configure() {
      // this.element.addEventListener("submit", this.submitHandler.bind(this));
      // 原始方法，通过bind（this）； 因为this.configure（）调用，所以configure函数内的this指向实例对象，所以this.element和this.submithandler处的this都指向实例对象
      this.element.addEventListener("submit", this.submitHandler); //利用auto-bind decorator
    }
    //Rendering //afterbegin => after begining tag
    private attach() {
      this.hostElement.insertAdjacentElement("afterbegin", this.element);
      // this.hostElement.appendChild(node);
      // this.hostElement.append(node);
      // this.hostElement.insertAdjacentElement();
      //区别在哪里？https://juejin.cn/post/7077923601810194439
    }
  }

  const project = new ProjectInput();
  const finishedProjectList = new ProjectList("finished");
  const activeProjectList2 = new ProjectList("active");
}
