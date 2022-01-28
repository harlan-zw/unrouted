_![unrouted - A minimal, composable router built for speed, portability and easy prototyping.](https://repository-images.githubusercontent.com/432034546/4642e228-880c-402b-83e4-042febd36446)
<p align="center">
<a href="https://npmjs.com/package/unrouted" target="_blank"><img src="https://img.shields.io/npm/dm/unrouted.svg?style=flat-square"/></a>
<a href="https://www.npmjs.com/package/@unrouted/core" target="__blank"><img src="https://img.shields.io/npm/v/@unrouted/core?color=2B90B6&label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@unrouted/core" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@unrouted/core?color=349dbe&label="></a>
<a href="https://unrouted.dev/" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=docs%20%26%20demos&color=45b8cd" alt="Docs & Demos"></a>
<br>
<a href="https://github.com/harlan-zw/unrouted" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/unrouted?style=social"></a>
</p>

<br>

<p align="center">
Unrouted is a minimal, composable router built for speed, portability and easy prototyping
</p>

<p align="center">
  <a href="https://unrouted.dev/>Documentation</a>
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="2000" height="0" /><br>
Status: <b>Public Beta 🎉</b><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a></sub><br>
<img width="2000" height="0" />
</td>
</tbody>
</table>
</p>


## Features

### Composable
- HTTP verb methods exposed as composable functions `get, post, put, delete, patch, options, head, connect, trace, connect`

### Portable

### Hackable
- Hook system powered by Hookable

### Easy debugging and testing

* ⚡️ **Composable**: 
* **Portable**:
* **Speedy**:
* **Test kit**
* 🛠 **Hackable**


## Getting Started

Add the dependency.

```bash
# NPM
npm add unrouted
# or Yarn
yarn add unrouted
# or PNPM
pnpm add unrouted
```

Create unlighthouse

```ts
import { createUnlighthouse, get, useBody } from 'unlighthouse'
// ...
async () => {
  const { handle, setup } = await createUnlighthouse({
    // options
  })
  
  await setup(() => {
      get('/welcome', 'Hey :)')

      post('/contact', () => {
        const { name, email } = useBody<{ name: string; email: string }>()
        // do something
        return {
            success: true,
        }
      })
  })
  
  server.use(handle)
}
```

## Guides

### Debugging

As unrouted is in early access, it's recommended you run it in debug mode.

```bash
# NPM
npx unrouted --site harlanzw.com --debug
# or PNPM
pnpm dlx unrouted --site harlanzw.com  --debug
```

### Configuration

The easiest way to configure the scan is to create a `unrouted.config.ts` in the directory
you're running the command.

```ts
export default {
    site: 'harlanzw.com',
    scanner: {
        // exclude specific routes
        exclude: [
            '/.*?pdf',
            '.*/amp',
            'en-*',
        ],
        // run lighthouse for each URL 3 times
        samples: 3,
        // use desktop to scan
        device: 'desktop',
        // enable the throttling mode
        throttle: true,
    },
    debug: true,
}
```

See [Config](https://unrouted.dev/config/#configuration) for the full details on what you can provide.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/harlan-zw/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/harlan-zw/static/sponsors.svg'/>
  </a>
</p>

## License

MIT License © 2022 [Harlan Wilton](https://github.com/harlan-zw)_
