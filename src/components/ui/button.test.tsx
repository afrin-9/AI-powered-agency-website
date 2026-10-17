import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Get in touch</Button>);
    expect(screen.getByRole("button", { name: "Get in touch" })).toBeInTheDocument();
  });
});
