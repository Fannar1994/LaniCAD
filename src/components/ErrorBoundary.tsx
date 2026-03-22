import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 font-condensed text-xl font-bold text-brand-dark">
              Villa kom upp
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Eitthvað fór úrskeiðis. Reyndu aftur eða farðu á upphafssíðu.
            </p>
            {this.state.error && (
              <p className="mt-3 rounded bg-gray-100 p-2 text-xs text-gray-400 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-brand-dark hover:bg-yellow-400"
              >
                Reyna aftur
              </button>
              <a
                href="/"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Upphafssíða
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
