import { Pipe, PipeTransform } from '@angular/core';

export interface IFilter {
    filter: (items: any []) => any []
}

@Pipe({
    name: 'filterPipe',
    pure: false
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], filter: (items: any []) => any []): any {
        if (!items || !filter || typeof(filter) !== 'function') {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        // return items.filter(item => item.title.indexOf(filter.value) !== -1);
        return filter(items);
    }
}
