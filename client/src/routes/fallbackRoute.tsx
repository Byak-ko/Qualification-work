import PageFallback from "../components/PageFallback";

export const fallbackRoute = [
    {
        path: '*',
        element: <PageFallback code="404" message="Page not found" />
    }
]