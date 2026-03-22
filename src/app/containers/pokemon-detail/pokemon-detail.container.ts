import { injectTwHostClass } from 'util/inject-tw-host-class.util';

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PokemonClient } from 'pokenode-ts';

import { PokemonInfoComponent } from '../../components/pokemon-info/pokemon-info.component';

type Tab = 'moves' | 'stats' | 'cry';

@Component({
    selector: 'app-pokemon-detail',
    imports: [PokemonInfoComponent],
    template: `
        <div class="w-full bg-black text-white h-60 p-2 rounded-md shadow-inner">
            @if (currentPokemonInfo.data(); as pokemonInfo) {
                <app-pokemon-info [pokemonInfo]="pokemonInfo" />
            }
        </div>

        <div class="flex flex-row *:flex-auto gap-2">
            <button
                class="p-2 rounded-md"
                [class]="activeTab() === 'moves' ? 'bg-cyan-500 text-white' : 'bg-cyan-300'"
                (click)="activeTab.set('moves')"
            >Moves
            </button>
            <button
                class="p-2 rounded-md"
                [class]="activeTab() === 'stats' ? 'bg-cyan-500 text-white' : 'bg-cyan-300'"
                (click)="activeTab.set('stats')"
            >Stats
            </button>
            <button
                class="p-2 rounded-md"
                [class]="activeTab() === 'cry' ? 'bg-cyan-500 text-white' : 'bg-cyan-300'"
                (click)="activeTab.set('cry')"
            >🔊 Cry
            </button>
        </div>

        <div class="grow bg-gray-200 p-4 rounded-md">
            @switch (activeTab()) {
                @case ('moves') {
                    <ul class="grid grid-cols-2 gap-1 text-sm">
                        @for (move of currentPokemonInfo.data()?.moves?.slice(0, 20); track move.move.name) {
                            <li class="bg-white px-2 py-1 rounded capitalize">
                                {{ move.move.name.replace('-', ' ') }}
                            </li>
                        }
                    </ul>
                }
                @case ('stats') {
                    <ul class="flex flex-col gap-2">
                        @for (stat of currentPokemonInfo.data()?.stats; track stat.stat.name) {
                            <li class="flex items-center gap-2 text-sm">
                                <span class="w-24 capitalize text-right">{{ stat.stat.name }}</span>
                                <div class="flex-1 bg-gray-300 rounded-full h-3">
                                    <div
                                        class="bg-cyan-500 h-3 rounded-full"
                                        [style.width.%]="(stat.base_stat / 255) * 100"
                                    ></div>
                                </div>
                                <span class="w-8 text-right font-bold">{{ stat.base_stat }}</span>
                            </li>
                        }
                    </ul>
                }
                @case ('cry') {
                    <div class="flex flex-col items-center gap-4 py-4">
                        <p class="text-gray-600 text-sm">
                            Hear the cry of {{ pokemonId() }}!
                        </p>
                        <button
                            class="text-5xl hover:scale-110 transition-transform active:scale-95"
                            (click)="playCry()"
                        >🔊
                        </button>
                    </div>
                }
            }
        </div>
    `,
    standalone: true
})
export class PokemonDetailContainer {
    private readonly api = new PokemonClient();
    private readonly route = inject(ActivatedRoute);

    readonly pokemonId = signal(this.route.snapshot.params['pokemonId'] ?? 'bulbasaur');
    readonly activeTab = signal<Tab>('moves');

    readonly currentPokemonInfo = injectQuery(() => ({
        queryKey: ['pokemon', this.pokemonId()],
        queryFn: () => this.api.getPokemonByName(this.pokemonId()),
    }));

    constructor() {
        injectTwHostClass(() => 'flex flex-col gap-4 p-5 pt-20');

        this.route.params.subscribe(params => {
            if (params['pokemonId']) {
                this.pokemonId.set(params['pokemonId']);
                this.activeTab.set('moves');
            }
        });
    }

    playCry() {
        const id = this.currentPokemonInfo.data()?.id;
        if (!id) return;
        const audio = new Audio(
            `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
        );
        audio.play();
    }
}