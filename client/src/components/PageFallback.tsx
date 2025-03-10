import CloseIcon from "./ui/icons/CloseIcon"

type PageFallbackProps = {
    code?: string,
    message?: string
}

const PageFallback = ({ code, message }: PageFallbackProps) => {

    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="space-y-2 flex flex-col justify-center items-center p-16 border-3">
                <div className="p-2 rounded-full border-2 object-cover size-fit flex justify-center items-center">
                    <CloseIcon width={'32px'} height={"32px"} />
                </div>
                <h1 className="text-8xl">{code}</h1>
                <h3 className="text-2xl">{message}</h3>
            </div>
        </div>
    )
}

export default PageFallback