import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

type PageFallbackProps = {
    code?: string,
    message?: string
}

const PageFallback = ({ code = "404", message = "Сторінку не знайдено" }: PageFallbackProps) => {
    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="space-y-6 flex flex-col justify-center items-center p-8 md:p-16 border border-gray-200 rounded-2xl shadow-xl bg-white max-w-md mx-4">
                <div className="p-4 rounded-full border-2 border-amber-500 object-cover flex justify-center items-center bg-amber-50">
                    <ExclamationTriangleIcon className="h-16 w-16 text-amber-500" aria-hidden="true" />
                </div>
                <h1 className="text-7xl md:text-8xl font-bold text-gray-800">{code}</h1>
                <h3 className="text-xl md:text-2xl text-center text-gray-600">{message}</h3>
                <div className="flex gap-4 pt-4">
                    <button
                        className="px-6 py-2 flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Оновити</span>
                    </button>
                    <button
                        className="px-6 py-2 flex items-center gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        onClick={() => window.location.href = '/'}
                    >
                        <HomeIcon className="h-5 w-5" />
                        <span>На головну</span>
                    </button>
                </div>
                <div className="text-sm text-gray-500 pt-2">
                    Якщо проблема повторюється, зв'яжіться з нами.
                </div>
            </div>
        </div>
    )
}

export default PageFallback;