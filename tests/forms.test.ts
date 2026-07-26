import { describe, expect, it } from "vitest";
import {
  Email,
  Field,
  Form,
  MinLength,
  Pattern,
  Required,
  bindError,
  bindInput,
} from "../src/forms/index.ts";

describe("Validators (Strategy)", () => {
  it("Required rejects empty or whitespace values", () => {
    const required = new Required();
    expect(required.validate("")).not.toBeNull();
    expect(required.validate("   ")).not.toBeNull();
    expect(required.validate("ok")).toBeNull();
  });

  it("MinLength rejects values shorter than the limit", () => {
    const minLength = new MinLength(3);
    expect(minLength.validate("ab")).not.toBeNull();
    expect(minLength.validate("abc")).toBeNull();
  });

  it("Email rejects malformed addresses", () => {
    const email = new Email();
    expect(email.validate("nope")).not.toBeNull();
    expect(email.validate("a@b.com")).toBeNull();
  });

  it("Pattern rejects values that do not match the regex", () => {
    const digits = new Pattern(/^\d+$/, "Chiffres uniquement.");
    expect(digits.validate("12a")).toBe("Chiffres uniquement.");
    expect(digits.validate("123")).toBeNull();
  });
});

describe("Field", () => {
  it("keeps the first failing validator's message", () => {
    const field = new Field("", [new Required(), new Email()]);
    field.setValue("");
    expect(field.error.getValue()).toBe("Ce champ est requis.");
    field.setValue("nope");
    expect(field.error.getValue()).toBe("Adresse email invalide.");
    field.setValue("a@b.com");
    expect(field.error.getValue()).toBeNull();
  });

  it("validate() returns whether the current value is valid", () => {
    const field = new Field("", [new Required()]);
    expect(field.validate()).toBe(false);
    field.setValue("hello");
    expect(field.validate()).toBe(true);
  });
});

describe("bindInput / bindError", () => {
  it("syncs the field and the input both ways", () => {
    const field = new Field("", [new Required()]);
    const input = document.createElement("input");
    bindInput(field, input);

    field.setValue("hello");
    expect(input.value).toBe("hello");

    input.value = "world";
    input.dispatchEvent(new Event("input"));
    expect(field.value.getValue()).toBe("world");
  });

  it("shows the error message in the target element", () => {
    const field = new Field("", [new Required()]);
    const hint = document.createElement("span");
    bindError(field, hint);

    field.validate();
    expect(hint.textContent).toBe("Ce champ est requis.");
    field.setValue("ok");
    expect(hint.textContent).toBe("");
  });
});

describe("Form", () => {
  function createForm(): Form<"title" | "email"> {
    return new Form({
      title: new Field("", [new Required()]),
      email: new Field("", [new Required(), new Email()]),
    });
  }

  it("submit() returns null while any field is invalid", () => {
    const form = createForm();
    expect(form.submit()).toBeNull();

    form.field("title").setValue("Ma tâche");
    form.field("email").setValue("bad");
    expect(form.submit()).toBeNull();
  });

  it("submit() returns the typed values once everything is valid", () => {
    const form = createForm();
    form.field("title").setValue("Ma tâche");
    form.field("email").setValue("a@b.com");

    expect(form.submit()).toEqual({ title: "Ma tâche", email: "a@b.com" });
  });

  it("validate() fills each field error for display", () => {
    const form = createForm();
    form.validate();
    expect(form.field("title").error.getValue()).toBe("Ce champ est requis.");
  });
});
