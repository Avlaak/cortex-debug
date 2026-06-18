# Debug Console ANSI colors

Embedd Cortex-Debug 1.14.8 and newer can render ANSI styling sequences in the VS Code Debug Console.

No `launch.json` setting is required. The extension enables ANSI styling support during debug adapter initialization and keeps GDB/MI `\e` escape sequences intact when console stream output is parsed.

## Requirements

- Embedd Cortex-Debug 1.14.8 or newer.
- A VS Code version that honors the Debug Adapter Protocol `supportsANSIStyling` capability.
- Target, semihosting, or GDB console output that emits ANSI SGR escape sequences.

After updating the extension, reload VS Code or restart the debug session so the new debug adapter capability is announced.

## Example

Firmware or target-side code can write ANSI color sequences directly:

```c
printf("\x1b[31mFAIL\x1b[0m Reserve section failed\r\n");
```

When the output reaches the Debug Console, `FAIL` is shown in red and the control sequences are hidden.

GDB/MI console stream output that uses the GDB escape form is also supported:

```text
~"\e[31mFAIL\e[0m Reserve section failed\n"
```

The parser converts `\e` to the ESC byte before VS Code renders the Debug Console text.
