import ReactMarkdown from 'react-markdown'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

interface MarkdownPreviewProps {
  value?: string
  className?: string
  attachments?: Record<string, { dataUrl: string }>
}

export const MarkdownPreview = ({ value, className, attachments }: MarkdownPreviewProps) => (
  <div className={className}>
    <ReactMarkdown
      rehypePlugins={[
        [
          rehypeSanitize,
          {
            ...defaultSchema,
            tagNames: [...(defaultSchema.tagNames ?? []), 'img'],
            attributes: {
              ...defaultSchema.attributes,
              img: ['src', 'alt', 'title'],
            },
            protocols: {
              ...defaultSchema.protocols,
              src: ['http', 'https', 'data', 'attachment'],
            },
          },
        ],
      ]}
      components={{
        img: ({ src, alt, title }) => {
          if (!src) return null
          const resolvedSrc = src.startsWith('attachment:')
            ? attachments?.[src.replace('attachment:', '')]?.dataUrl
            : src
          if (!resolvedSrc) return null
          return <img src={resolvedSrc} alt={alt ?? ''} title={title} />
        },
      }}
    >
      {value ?? ''}
    </ReactMarkdown>
  </div>
)

// Update
