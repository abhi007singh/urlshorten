(() => {
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];

  if (cookieToken) {
    const waitForSwaggerUI = (): void => {
      const swaggerUI = document.getElementById("swagger-ui");

      if (swaggerUI && swaggerUI.querySelector(".authorize")) {
        // Swagger UI is rendered, proceed to interact with it
        const authorizeButton = swaggerUI.querySelector(
          ".authorize"
        ) as HTMLElement | null;

        if (authorizeButton) {
          authorizeButton.click();

          setTimeout(() => {
            const input = swaggerUI.querySelector(
              "input[id='auth-bearer-value']"
            ) as HTMLInputElement | null;

            if (input) {
              input.value = cookieToken;

              // Trigger Swagger UI's internal change event
              const event = new Event("input", { bubbles: true });
              input.dispatchEvent(event);
            }
          }, 500);
        }
      } else {
        // Retry if Swagger UI has not fully rendered
        setTimeout(waitForSwaggerUI, 100);
      }
    };

    // Start checking for Swagger UI after the DOM is loaded
    document.addEventListener("DOMContentLoaded", waitForSwaggerUI);
  }
})();
