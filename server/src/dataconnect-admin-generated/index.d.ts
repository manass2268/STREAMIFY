import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Asset_Key {
  id: UUIDString;
  __typename?: 'Asset_Key';
}

export interface CreateAssetData {
  asset_insert: Asset_Key;
}

export interface CreateAssetVariables {
  ticker: string;
  name: string;
  type: string;
  portfolioId: UUIDString;
}

export interface CreateDividendData {
  dividend_insert: Dividend_Key;
}

export interface CreateDividendVariables {
  amount: number;
  assetId: UUIDString;
}

export interface CreateGoalData {
  goal_insert: Goal_Key;
}

export interface CreateGoalVariables {
  targetValue: number;
  portfolioId: UUIDString;
}

export interface CreateHoldingData {
  holding_insert: Holding_Key;
}

export interface CreateHoldingVariables {
  quantity: number;
  purchasePrice: number;
  assetId: UUIDString;
}

export interface CreatePortfolioData {
  portfolio_insert: Portfolio_Key;
}

export interface CreatePortfolioVariables {
  name: string;
  description?: string | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface DeleteAssetData {
  asset_delete?: Asset_Key | null;
}

export interface DeleteAssetVariables {
  id: UUIDString;
}

export interface DeleteDividendData {
  dividend_delete?: Dividend_Key | null;
}

export interface DeleteDividendVariables {
  id: UUIDString;
}

export interface DeleteGoalData {
  goal_delete?: Goal_Key | null;
}

export interface DeleteGoalVariables {
  id: UUIDString;
}

export interface DeleteHoldingData {
  holding_delete?: Holding_Key | null;
}

export interface DeleteHoldingVariables {
  id: UUIDString;
}

export interface DeletePortfolioData {
  portfolio_delete?: Portfolio_Key | null;
}

export interface DeletePortfolioVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface Dividend_Key {
  id: UUIDString;
  __typename?: 'Dividend_Key';
}

export interface GetAssetData {
  asset?: {
    tickerSymbol: string;
    currentPrice?: number | null;
  };
}

export interface GetAssetVariables {
  id: UUIDString;
}

export interface GetCurrentUserData {
  user?: {
    email: string;
    displayName?: string | null;
    createdAt: TimestampString;
  };
}

export interface GetDividendData {
  dividend?: {
    amount: number;
    paymentDate: DateString;
  };
}

export interface GetDividendVariables {
  id: UUIDString;
}

export interface GetGoalData {
  goal?: {
    targetValue: number;
    status?: string | null;
  };
}

export interface GetGoalVariables {
  id: UUIDString;
}

export interface GetHoldingData {
  holding?: {
    quantity: number;
    purchasePrice: number;
  };
}

export interface GetHoldingVariables {
  id: UUIDString;
}

export interface GetPortfolioData {
  portfolio?: {
    name: string;
    description?: string | null;
    assets_on_portfolio: ({
      tickerSymbol: string;
      name: string;
    })[];
  };
}

export interface GetPortfolioVariables {
  id: UUIDString;
}

export interface Goal_Key {
  id: UUIDString;
  __typename?: 'Goal_Key';
}

export interface Holding_Key {
  id: UUIDString;
  __typename?: 'Holding_Key';
}

export interface ListAssetsData {
  assets: ({
    tickerSymbol: string;
    name: string;
  })[];
}

export interface ListAssetsVariables {
  portfolioId: UUIDString;
}

export interface ListDividendsData {
  dividends: ({
    amount: number;
    paymentDate: DateString;
  })[];
}

export interface ListDividendsVariables {
  assetId: UUIDString;
}

export interface ListGoalsData {
  goals: ({
    targetValue: number;
    targetDate: DateString;
  })[];
}

export interface ListGoalsVariables {
  portfolioId: UUIDString;
}

export interface ListHoldingsData {
  holdings: ({
    quantity: number;
    purchaseDate: DateString;
  })[];
}

export interface ListHoldingsVariables {
  assetId: UUIDString;
}

export interface ListMyPortfoliosData {
  portfolios: ({
    id: UUIDString;
    name: string;
  } & Portfolio_Key)[];
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    email: string;
    displayName?: string | null;
  } & User_Key)[];
}

export interface Portfolio_Key {
  id: UUIDString;
  __typename?: 'Portfolio_Key';
}

export interface UpdateAssetData {
  asset_update?: Asset_Key | null;
}

export interface UpdateAssetVariables {
  id: UUIDString;
  price?: number | null;
}

export interface UpdateDividendData {
  dividend_update?: Dividend_Key | null;
}

export interface UpdateDividendVariables {
  id: UUIDString;
  amount?: number | null;
}

export interface UpdateGoalData {
  goal_update?: Goal_Key | null;
}

export interface UpdateGoalVariables {
  id: UUIDString;
  status?: string | null;
}

export interface UpdateHoldingData {
  holding_update?: Holding_Key | null;
}

export interface UpdateHoldingVariables {
  id: UUIDString;
  quantity?: number | null;
}

export interface UpdatePortfolioData {
  portfolio_update?: Portfolio_Key | null;
}

export interface UpdatePortfolioVariables {
  id: UUIDString;
  name?: string | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserVariables {
  displayName?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function updateUser(dc: DataConnect, vars?: UpdateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateUser(vars?: UpdateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateUserData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteUser' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteUser(options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteUserData>>;

/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to execute without passing in DataConnect. */
export function getCurrentUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to pass in custom DataConnect instances. */
export function getCurrentUser(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to execute without passing in DataConnect. */
export function listUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePortfolio' Mutation. Allow users to execute without passing in DataConnect. */
export function createPortfolio(dc: DataConnect, vars: CreatePortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePortfolioData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePortfolio' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPortfolio(vars: CreatePortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePortfolioData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePortfolio' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePortfolio(dc: DataConnect, vars: UpdatePortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePortfolioData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePortfolio' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePortfolio(vars: UpdatePortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePortfolioData>>;

/** Generated Node Admin SDK operation action function for the 'DeletePortfolio' Mutation. Allow users to execute without passing in DataConnect. */
export function deletePortfolio(dc: DataConnect, vars: DeletePortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeletePortfolioData>>;
/** Generated Node Admin SDK operation action function for the 'DeletePortfolio' Mutation. Allow users to pass in custom DataConnect instances. */
export function deletePortfolio(vars: DeletePortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeletePortfolioData>>;

/** Generated Node Admin SDK operation action function for the 'GetPortfolio' Query. Allow users to execute without passing in DataConnect. */
export function getPortfolio(dc: DataConnect, vars: GetPortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetPortfolioData>>;
/** Generated Node Admin SDK operation action function for the 'GetPortfolio' Query. Allow users to pass in custom DataConnect instances. */
export function getPortfolio(vars: GetPortfolioVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetPortfolioData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyPortfolios' Query. Allow users to execute without passing in DataConnect. */
export function listMyPortfolios(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyPortfoliosData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyPortfolios' Query. Allow users to pass in custom DataConnect instances. */
export function listMyPortfolios(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyPortfoliosData>>;

/** Generated Node Admin SDK operation action function for the 'CreateAsset' Mutation. Allow users to execute without passing in DataConnect. */
export function createAsset(dc: DataConnect, vars: CreateAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAssetData>>;
/** Generated Node Admin SDK operation action function for the 'CreateAsset' Mutation. Allow users to pass in custom DataConnect instances. */
export function createAsset(vars: CreateAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAssetData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateAsset' Mutation. Allow users to execute without passing in DataConnect. */
export function updateAsset(dc: DataConnect, vars: UpdateAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateAssetData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateAsset' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateAsset(vars: UpdateAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateAssetData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteAsset' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteAsset(dc: DataConnect, vars: DeleteAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteAssetData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteAsset' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteAsset(vars: DeleteAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteAssetData>>;

/** Generated Node Admin SDK operation action function for the 'GetAsset' Query. Allow users to execute without passing in DataConnect. */
export function getAsset(dc: DataConnect, vars: GetAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetAssetData>>;
/** Generated Node Admin SDK operation action function for the 'GetAsset' Query. Allow users to pass in custom DataConnect instances. */
export function getAsset(vars: GetAssetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetAssetData>>;

/** Generated Node Admin SDK operation action function for the 'ListAssets' Query. Allow users to execute without passing in DataConnect. */
export function listAssets(dc: DataConnect, vars: ListAssetsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAssetsData>>;
/** Generated Node Admin SDK operation action function for the 'ListAssets' Query. Allow users to pass in custom DataConnect instances. */
export function listAssets(vars: ListAssetsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAssetsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateHolding' Mutation. Allow users to execute without passing in DataConnect. */
export function createHolding(dc: DataConnect, vars: CreateHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateHoldingData>>;
/** Generated Node Admin SDK operation action function for the 'CreateHolding' Mutation. Allow users to pass in custom DataConnect instances. */
export function createHolding(vars: CreateHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateHoldingData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateHolding' Mutation. Allow users to execute without passing in DataConnect. */
export function updateHolding(dc: DataConnect, vars: UpdateHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateHoldingData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateHolding' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateHolding(vars: UpdateHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateHoldingData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteHolding' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteHolding(dc: DataConnect, vars: DeleteHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteHoldingData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteHolding' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteHolding(vars: DeleteHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteHoldingData>>;

/** Generated Node Admin SDK operation action function for the 'GetHolding' Query. Allow users to execute without passing in DataConnect. */
export function getHolding(dc: DataConnect, vars: GetHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetHoldingData>>;
/** Generated Node Admin SDK operation action function for the 'GetHolding' Query. Allow users to pass in custom DataConnect instances. */
export function getHolding(vars: GetHoldingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetHoldingData>>;

/** Generated Node Admin SDK operation action function for the 'ListHoldings' Query. Allow users to execute without passing in DataConnect. */
export function listHoldings(dc: DataConnect, vars: ListHoldingsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListHoldingsData>>;
/** Generated Node Admin SDK operation action function for the 'ListHoldings' Query. Allow users to pass in custom DataConnect instances. */
export function listHoldings(vars: ListHoldingsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListHoldingsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateDividend' Mutation. Allow users to execute without passing in DataConnect. */
export function createDividend(dc: DataConnect, vars: CreateDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDividendData>>;
/** Generated Node Admin SDK operation action function for the 'CreateDividend' Mutation. Allow users to pass in custom DataConnect instances. */
export function createDividend(vars: CreateDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDividendData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateDividend' Mutation. Allow users to execute without passing in DataConnect. */
export function updateDividend(dc: DataConnect, vars: UpdateDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateDividendData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateDividend' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateDividend(vars: UpdateDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateDividendData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteDividend' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteDividend(dc: DataConnect, vars: DeleteDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteDividendData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteDividend' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteDividend(vars: DeleteDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteDividendData>>;

/** Generated Node Admin SDK operation action function for the 'GetDividend' Query. Allow users to execute without passing in DataConnect. */
export function getDividend(dc: DataConnect, vars: GetDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetDividendData>>;
/** Generated Node Admin SDK operation action function for the 'GetDividend' Query. Allow users to pass in custom DataConnect instances. */
export function getDividend(vars: GetDividendVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetDividendData>>;

/** Generated Node Admin SDK operation action function for the 'ListDividends' Query. Allow users to execute without passing in DataConnect. */
export function listDividends(dc: DataConnect, vars: ListDividendsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDividendsData>>;
/** Generated Node Admin SDK operation action function for the 'ListDividends' Query. Allow users to pass in custom DataConnect instances. */
export function listDividends(vars: ListDividendsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDividendsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateGoal' Mutation. Allow users to execute without passing in DataConnect. */
export function createGoal(dc: DataConnect, vars: CreateGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateGoalData>>;
/** Generated Node Admin SDK operation action function for the 'CreateGoal' Mutation. Allow users to pass in custom DataConnect instances. */
export function createGoal(vars: CreateGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateGoalData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateGoal' Mutation. Allow users to execute without passing in DataConnect. */
export function updateGoal(dc: DataConnect, vars: UpdateGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateGoalData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateGoal' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateGoal(vars: UpdateGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateGoalData>>;

/** Generated Node Admin SDK operation action function for the 'DeleteGoal' Mutation. Allow users to execute without passing in DataConnect. */
export function deleteGoal(dc: DataConnect, vars: DeleteGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteGoalData>>;
/** Generated Node Admin SDK operation action function for the 'DeleteGoal' Mutation. Allow users to pass in custom DataConnect instances. */
export function deleteGoal(vars: DeleteGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<DeleteGoalData>>;

/** Generated Node Admin SDK operation action function for the 'GetGoal' Query. Allow users to execute without passing in DataConnect. */
export function getGoal(dc: DataConnect, vars: GetGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetGoalData>>;
/** Generated Node Admin SDK operation action function for the 'GetGoal' Query. Allow users to pass in custom DataConnect instances. */
export function getGoal(vars: GetGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetGoalData>>;

/** Generated Node Admin SDK operation action function for the 'ListGoals' Query. Allow users to execute without passing in DataConnect. */
export function listGoals(dc: DataConnect, vars: ListGoalsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListGoalsData>>;
/** Generated Node Admin SDK operation action function for the 'ListGoals' Query. Allow users to pass in custom DataConnect instances. */
export function listGoals(vars: ListGoalsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListGoalsData>>;

