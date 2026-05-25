import { formatCurrency, formatDate } from '../utils/formatters.js'

export default function RentalInfo({ rental }) {
  return (
    <dl className="detail-list">
      <div>
        <dt>Cliente</dt>
        <dd>{rental.clienteNome}</dd>
      </div>
      <div>
        <dt>Telefone</dt>
        <dd>{rental.clienteTelefone || '-'}</dd>
      </div>
      <div>
        <dt>Endereço</dt>
        <dd>{rental.clienteEndereco || '-'}</dd>
      </div>
      <div>
        <dt>CPF</dt>
        <dd>{rental.clienteCpf || '-'}</dd>
      </div>
      <div>
        <dt>Data da festa</dt>
        <dd>{formatDate(rental.dataFesta)}</dd>
      </div>
      <div>
        <dt>Retirada</dt>
        <dd>{formatDate(rental.dataRetirada)}</dd>
      </div>
      <div>
        <dt>Devolução prevista</dt>
        <dd>{formatDate(rental.dataDevolucaoPrevista)}</dd>
      </div>
      <div>
        <dt>Valor</dt>
        <dd>{formatCurrency(rental.valor)}</dd>
      </div>
      <div>
        <dt>Sinal pago</dt>
        <dd>{formatCurrency(rental.sinalPago)}</dd>
      </div>
      {rental.observacoes ? (
        <div className="wide">
          <dt>Observações</dt>
          <dd>{rental.observacoes}</dd>
        </div>
      ) : null}
    </dl>
  )
}
