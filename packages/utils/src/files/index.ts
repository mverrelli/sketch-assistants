import StreamZip from 'node-stream-zip'
import { SketchFile, FileFormat } from '@sketch-hq/sketch-assistant-types'
import { basename } from 'path'

/**
 * Given a path to a Sketch file on the file system, this function unzips the
 * JSON entries and parses them out into a SketchFile object.
 */
const fromFile = async (filepath: string): Promise<SketchFile> => {
  const archive = new StreamZip({
    file: filepath,
    storeEntries: true,
  })

  const contents: FileFormat.Contents = await new Promise((resolve): void => {
    archive.on('ready', (): void => {
      const document = JSON.parse(archive.entryDataSync('document.json').toString())
      const pages = document.pages.map((page: { _ref: string }): void =>
        JSON.parse(archive.entryDataSync(`${page._ref}.json`).toString()),
      )
      const workspace = Object.keys(archive.entries())
        .filter((key) => key.startsWith('workspace/'))
        .reduce((acc, key) => {
          return {
            ...acc,
            [basename(key, '.json')]: JSON.parse(archive.entryDataSync(key).toString()),
          }
        }, {})

      resolve({
        document: {
          ...document,
          pages,
        },
        meta: JSON.parse(archive.entryDataSync('meta.json').toString()),
        user: JSON.parse(archive.entryDataSync('user.json').toString()),
        workspace,
      })
    })
  })

  archive.close()

  return { filepath, contents }
}

/**
 * Filter pages out of a SketchFile object based on page ids.
 */
const filterPages = (file: SketchFile, excludedPageIds: string[]): SketchFile => ({
  ...file,
  contents: {
    ...file.contents,
    document: {
      ...file.contents.document,
      pages: file.contents.document.pages.filter(
        (page) => !excludedPageIds.includes(page.do_objectID),
      ),
    },
  },
})

export { fromFile, filterPages }
