import { List } from 'immutable';

class FormatterFactory {
    formatters: List<any>;

    constructor() {
        this.formatters = List();
    }

    format(html: string) {
        const formatted = this.formatters.reduce((formattedData, formatter) => {
            return formatter(formattedData);
        }, html);

        return formatted;
    }
}

class HTMLFormatterFactory extends FormatterFactory {
    // @ts-ignore
    formatters: {
        sanitize: List<any>,
        normalize: List<any>,
        export: List<any>
    };

    constructor() {
        super();
        this.formatters = {
            sanitize: List(),
            normalize: List(),
            export: List()
        };
    }

    format(html: string) {
        const formatters = this.formatters.sanitize.concat(this.formatters.normalize);

        const formatted = formatters.reduce((formattedData, formatter) => {
            return formatter(formattedData);
        }, html);

        return formatted;
    }

    formatForExport(html: string) {
        return this.formatters.export.reduce((formattedData, formatter) => {
            return formatter(formattedData);
        }, html);
    }
}

export {FormatterFactory, HTMLFormatterFactory}