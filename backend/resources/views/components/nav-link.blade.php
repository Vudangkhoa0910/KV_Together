@props(['active'])

@php
$classes = ($active ?? false)
            ? 'text-white font-semibold tracking-wide underline decoration-yellow-300 transition duration-150 ease-in-out'
            : 'text-white font-semibold tracking-wide hover:underline hover:decoration-yellow-300 transition duration-150 ease-in-out';
@endphp

<a {{ $attributes->class([$classes]) }}>
    {{ $slot }}
</a>