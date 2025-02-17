<script lang="ts">
  import Token from '$lib/components/token/token.svelte';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../../funder-onboarding-flow';
  import unreachable from '$lib/utils/unreachable';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import { constants } from 'radicle-drips';
  import formatDate from '$lib/utils/format-date';

  export let context: Writable<State>;

  let streamRateValueParsed: bigint | undefined, topUpAmountValueParsed: bigint | undefined;
  $: ({ streamRateValueParsed, topUpAmountValueParsed } = $context.continuousSupportConfig);

  $: token =
    $context.selectedSupportOption === 1
      ? tokensStore.getByAddress($context.continuousSupportConfig.listSelected[0])
      : undefined;

  let lastsUntil: string | undefined;
  $: {
    if (streamRateValueParsed !== undefined && topUpAmountValueParsed !== undefined) {
      const durationSeconds =
        (topUpAmountValueParsed /
          (streamRateValueParsed / BigInt(constants.AMT_PER_SEC_MULTIPLIER))) *
        86400n *
        30n;

      const timestamp = new Date(Date.now() + Number(durationSeconds) * 1000);

      lastsUntil =
        topUpAmountValueParsed > 0 ? `≈ ${formatDate(timestamp, 'dayAndYear')}` : undefined;
    }
  }
</script>

<div class="key-value-row">
  <div class="key-value-pair">
    <h5 class="key">Token</h5>
    <span class="value"
      ><Token address={$context.continuousSupportConfig.listSelected[0]} size="small" /></span
    >
  </div>
  <div class="key-value-pair">
    <h5 class="key">Stream rate</h5>
    <span class="value typo-text tabular-nums"
      >{formatTokenAmount(
        streamRateValueParsed ?? unreachable(),
        token?.info.decimals ?? unreachable(),
        undefined,
        false,
      )}
      <span class="muted">{token?.info.symbol ?? unreachable()}/mo</span></span
    >
  </div>
</div>
{#if topUpAmountValueParsed}
  <div class="key-value-row">
    <div class="key-value-pair">
      <h5 class="key">Initial top-up</h5>
      <span class="value typo-text tabular-nums"
        >{formatTokenAmount(
          topUpAmountValueParsed,
          token?.info.decimals ?? unreachable(),
          1n,
          false,
        )} <span class="muted">{token?.info.symbol ?? unreachable()}</span></span
      >
    </div>
    {#if lastsUntil}
      <div class="key-value-pair">
        <h5 class="key">Lasts until</h5>
        <span class="value typo-text">{lastsUntil}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .key-value-row {
    display: flex;
    gap: 1rem;
  }

  .key-value-row:not(:last-child) {
    margin-bottom: 1rem;
  }

  .key-value-pair {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 50%;
  }

  .key-value-pair h5 {
    color: var(--color-foreground-level-6);
  }

  .muted {
    color: var(--color-foreground-level-6);
  }
</style>
