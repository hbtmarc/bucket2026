import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownPreviewProps {
  value?: string
  className?: string
}

export const MarkdownPreview = ({ value, className }: MarkdownPreviewProps) => (
  <div className={className}>
    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
      {value ?? ''}
    </ReactMarkdown>
  </div>
)
