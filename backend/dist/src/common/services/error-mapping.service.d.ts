export declare class ErrorMappingService {
    private readonly mappings;
    constructor();
    private initializeMappings;
    mapValidationError(constraint: string, property: string): {
        field: string;
        message: string;
    };
    mapErrorMessage(rawMessage: string): {
        status: number;
        message: string;
        field?: string;
    };
}
