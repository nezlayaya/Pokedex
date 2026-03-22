import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { SimplePokemon } from 'types/simple-pokemon.type';

import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';

interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SimplePokemon[];
}

@Component({
    selector: 'app-all-pokemon-list',
    imports: [PokemonListComponent],
    template: `
        <app-pokemon-list
            [pokemonList]="allPokemon()"
            [hasMore]="!!pokemonQuery.data()?.next"
            [isLoadingMore]="pokemonQuery.isFetching()"
            (loadMore)="loadMore()"
        />
    `,
    standalone: true
})
export class AllPokemonListContainer {
    private readonly httpClient = inject(HttpClient);

    private readonly offset = signal(0);
    private readonly limit = 20;
    private readonly accumulatedPokemon = signal<SimplePokemon[]>([]);

    readonly pokemonQuery = injectQuery(() => ({
        queryKey: ['pokemon-list', this.offset()],
        queryFn: async () => {
            const response = await firstValueFrom(
                this.httpClient.get<PokemonListResponse>(
                    `/api/v2/pokemon?offset=${this.offset()}&limit=${this.limit}`
                )
            );
            this.accumulatedPokemon.update(prev => [...prev, ...response.results]);
            return response;
        },
    }));

    readonly allPokemon = computed(() => this.accumulatedPokemon());

    loadMore() {
        this.offset.update(prev => prev + this.limit);
    }
}