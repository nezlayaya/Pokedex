import { Component, EventEmitter, input, Output, output } from '@angular/core';
import { SimplePokemon } from 'types/simple-pokemon.type';

import { PokemonListItemComponent } from '../pokemon-list-item/pokemon-list-item.component';

@Component({
    selector: 'app-pokemon-list',
    template: `
        <header>
            <nav>
                <button class="big-button blue"></button>
            </nav>
            <div class="nav-shadow"></div>

            <div class="top-bar">
                <button class="small-button red"></button>
                <button class="small-button yellow"></button>
                <button class="small-button green"></button>
            </div>
        </header>

        <div class="section-wrapper">
            <section>
                @for (pokemon of pokemonList(); track pokemon.name; let i = $index) {
                    <app-pokemon-list-item [index]="i" [pokemon]="pokemon" />
                }

                @if (hasMore()) {
                    <button
                        class="load-more-btn"
                        [disabled]="isLoadingMore()"
                        (click)="loadMore.emit()"
                    >
                        {{ isLoadingMore() ? '...' : 'Load more' }}
                    </button>
                }
            </section>
        </div>

        <footer></footer>
    `,
    styleUrl: './pokemon-list.component.scss',
    imports: [PokemonListItemComponent],
    standalone: true,
})
export class PokemonListComponent {
    readonly pokemonList = input<SimplePokemon[]>([]);
    readonly hasMore = input<boolean>(false);
    readonly isLoadingMore = input<boolean>(false);
    readonly loadMore = output<void>();
}