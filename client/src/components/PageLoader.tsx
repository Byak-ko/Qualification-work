import Loader from "./ui/Spinner"

const PageLoader = () => {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader size="large" />
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Завантаження даних...</p>
            </div>
        </div>
    );
};

export default PageLoader;