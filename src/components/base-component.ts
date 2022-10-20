//Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templateID: string,
    hostElmentId: string,
    insertAtStart: boolean,
    newElementId?: string // newElementId?: string 等同于 newElementId: string ｜ undefined
  ) {
    this.templateElement = document.getElementById(
      templateID
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElmentId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    // importedNode is document frament, and which is live; once we append or insert will all or part it will update this frament anywhere
    /**
             * A common use for DocumentFragment is to create one, assemble a DOM subtree within it, then append or insert the fragment into the DOM using Node interface methods such as appendChild(), append(), or insertBefore(). Doing this moves the fragment's nodes into the DOM, leaving behind an empty DocumentFragment.
             This interface is also of great use with Web components: <template> elements contain a DocumentFragment in their HTMLTemplateElement.content property.
             */
    this.element = importedNode.firstElementChild! as U;
    if (newElementId) this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
    // this.hostElement.insertAdjacentElement("beforeend", this.element);
    //即是我多次添加也只有一次，他是如何追踪的？ 这可能可以回答为什么我在attach后修改this.element.id仍然有效
  }
  abstract configure(): void;
  abstract renderContent(): void;
}
