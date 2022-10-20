//// <reference path="../util/validation.ts"/>
import { Component } from "./base-component";
import { Validatable, validation } from "../util/validation";
import { autobindDecorator } from "../decorators/autobind";
import { projectState } from "../state/project-state";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  //   private templateElement: HTMLTemplateElement;
  //   private hostElement: HTMLDivElement;
  titleInput: HTMLInputElement;
  peopleInput: HTMLInputElement;
  descriptionInput: HTMLInputElement;
  //   element: HTMLFormElement; // why we need this insead of using node directly? insertAdjacentElement 不接受node insert？
  constructor() {
    super("project-input", "app", true, "user-input");
    //Form input element
    this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
    this.peopleInput = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.descriptionInput = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;

    this.configure();
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
      min: 1,
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
  configure() {
    this.element.addEventListener("submit", this.submitHandler); //利用auto-bind decorator
  }
  renderContent() {}
}
