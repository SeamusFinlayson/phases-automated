# Phases Automated

![Phases Automated Header](https://github.com/user-attachments/assets/82a1294e-847c-499c-becf-0067a23699fa)

_Build encounters with complex automations managed through a simple menu_

Install link: https://phases-automated.onrender.com/manifest.json

## How It Works

[Watch the demo on YouTube](https://youtu.be/G6r8DLYnNsQ)

### Extension Anatomy

![Extension Anatomy ](https://github.com/user-attachments/assets/5e1d2e53-0b85-4353-b09d-47ee4b09fc8c)

### Good to Know

- When a token enters a new phase, its properties are initialized based on its current state
- A token can only be part of one automation
- The context menu can either add a token to the currently selected automation, or remove it from any automation
- Removing a property from the automation only deletes token data for the current phase. This means that if the property is added back to the automation, switching to other phases will set the token's state based on old data. Cycle through all phases after removing it to completely delete that property.

## Feature Requests

I may accept feature requests but - as I have limited time and development plans of my own - being a paid member on [Patreon](https://www.patreon.com/SeamusFinlayson) is your best path to getting a feature implemented.

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.gg/yWSErB6Qaj) @Seamus or open an issue on [GitHub](https://github.com/SeamusFinlayson/Phases-Automated).

If you like using this extension consider [supporting me on Patreon](https://www.patreon.com/SeamusFinlayson) where paid members can request features. You can also follow along there as a free member for updates.

## Building

This project uses [pnpm](https://pnpm.io/) as a package manager.

To install all the dependencies run:

`pnpm install`

To run in a development mode run:

`pnpm dev`

To make a production build run:

`pnpm build`

## License

GNU GPLv3

## Contributing

Copyright (C) 2023 Owlbear Rodeo

Copyright (C) 2023 Seamus Finlayson
