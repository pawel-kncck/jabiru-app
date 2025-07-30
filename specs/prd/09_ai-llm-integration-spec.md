# 7. AI/LLM Integration Specification

## 7.1. Overview

This document details the comprehensive integration strategy for Large Language Models (LLMs) and AI services within the Jabiru platform. The AI integration serves as the intelligent co-pilot that transforms natural language queries into precise data visualizations, narratives, and insights while maintaining transparency and accuracy.

### 7.1.1. AI Integration Philosophy

- **Transparent Intelligence:** AI assists but never obscures the underlying data or logic
- **Context-Aware:** AI understands business-specific terminology, metrics, and rules
- **Reliable Partnership:** AI enhances human capability without replacing human judgment
- **Iterative Learning:** AI continuously improves through user feedback and interaction patterns
- **Privacy-First:** User data is protected with enterprise-grade security and privacy controls

### 7.1.2. Core AI Capabilities

```yaml
ai_capabilities:
  natural_language_processing:
    - Query intent recognition
    - Business terminology understanding
    - Contextual prompt processing
    - Multi-language support
    
  data_analysis:
    - Automatic chart type selection
    - Statistical analysis suggestions
    - Anomaly detection and highlighting
    - Trend identification and forecasting
    
  content_generation:
    - Data-driven narrative creation
    - Insight summarization
    - Recommendation generation
    - Report automation
    
  intelligent_automation:
    - Data cleaning suggestions
    - Schema inference and mapping
    - Query optimization
    - Error detection and correction
```

## 7.2. LLM Provider Architecture

### 7.2.1. Multi-Provider Strategy

**Primary Providers:**
```yaml
openai:
  models:
    - gpt-4-turbo (primary for complex analysis)
    - gpt-3.5-turbo (secondary for simple tasks)
  use_cases:
    - Chart generation
    - Narrative creation
    - Code generation
    - Complex reasoning
  pricing: "Per token usage"
  
anthropic:
  models:
    - claude-3-opus (advanced reasoning)
    - claude-3-sonnet (balanced performance)
  use_cases:
    - Long-form analysis
    - Document summarization
    - Complex data interpretation
  pricing: "Per token usage"
  
azure_openai:
  models:
    - gpt-4 (enterprise deployment)
    - gpt-35-turbo (cost-effective option)
  use_cases:
    - Enterprise customers
    - Compliance requirements
    - Private deployment
  pricing: "Committed usage tiers"

local_models:
  models:
    - llama-2-70b (self-hosted option)
    - code-llama (code generation)
  use_cases:
    - High security environments
    - Cost optimization
    - Latency-sensitive operations
  pricing: "Infrastructure costs only"
```

### 7.2.2. Provider Abstraction Layer

```python
# AI Service Abstraction
class AIServiceProvider(ABC):
    """Abstract base class for AI service providers"""
    
    @abstractmethod
    async def generate_chart_config(
        self,
        prompt: str,
        schema: DataSchema,
        context: BusinessContext
    ) -> ChartConfig:
        pass
    
    @abstractmethod
    async def generate_narrative(
        self,
        chart_data: dict,
        context: BusinessContext
    ) -> str:
        pass
    
    @abstractmethod
    async def analyze_data_quality(
        self,
        data_sample: pd.DataFrame
    ) -> DataQualityReport:
        pass

class OpenAIProvider(AIServiceProvider):
    """OpenAI implementation"""
    
    def __init__(self, api_key: str, model: str = "gpt-4-turbo"):
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    async def generate_chart_config(
        self,
        prompt: str,
        schema: DataSchema,
        context: BusinessContext
    ) -> ChartConfig:
        system_prompt = self._build_system_prompt(schema, context)
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            functions=[chart_config_function_schema],
            function_call={"name": "generate_chart_config"}
        )
        
        return ChartConfig.parse_raw(
            response.choices[0].message.function_call.arguments
        )

class AIServiceManager:
    """Manages multiple AI providers with failover and load balancing"""
    
    def __init__(self):
        self.providers = {
            "openai": OpenAIProvider(config.OPENAI_API_KEY),
            "anthropic": AnthropicProvider(config.ANTHROPIC_API_KEY),
            "azure": AzureOpenAIProvider(config.AZURE_OPENAI_CONFIG)
        }
        self.default_provider = "openai"
        self.fallback_chain = ["openai", "anthropic", "azure"]
    
    async def generate_with_fallback(
        self,
        method_name: str,
        *args,
        **kwargs
    ) -> Any:
        """Execute AI operation with automatic failover"""
        for provider_name in self.fallback_chain:
            try:
                provider = self.providers[provider_name]
                method = getattr(provider, method_name)
                result = await method(*args, **kwargs)
                
                # Log successful provider usage
                self._log_usage(provider_name, method_name, success=True)
                return result
                
            except Exception as e:
                self._log_usage(provider_name, method_name, success=False, error=str(e))
                continue
        
        raise AIServiceUnavailableError("All AI providers failed")
```

## 7.3. Context Management System

### 7.3.1. Business Context Architecture

```python
class BusinessContext:
    """Comprehensive business context for AI operations"""
    
    def __init__(
        self,
        organization_id: str,
        project_id: Optional[str] = None
    ):
        self.organization_id = organization_id
        self.project_id = project_id
        self.domain = None
        self.metrics = []
        self.terminology = {}
        self.business_rules = []
        self.data_relationships = []
        self.version = 1
    
    def add_metric(self, metric: BusinessMetric):
        """Add a business metric definition"""
        self.metrics.append(metric)
        self._update_embeddings()
    
    def add_terminology(self, term: str, aliases: List[str]):
        """Add business terminology mapping"""
        self.terminology[term] = aliases
        self._update_embeddings()
    
    def add_business_rule(self, rule: BusinessRule):
        """Add a business rule or constraint"""
        self.business_rules.append(rule)
        self._update_embeddings()
    
    def _update_embeddings(self):
        """Update vector embeddings for context search"""
        context_service = ContextService()
        context_service.update_embeddings(self)

class BusinessMetric:
    """Business metric definition with AI context"""
    
    def __init__(
        self,
        name: str,
        formula: str,
        description: str,
        aggregation_type: str = "sum",
        aliases: List[str] = None
    ):
        self.name = name
        self.formula = formula
        self.description = description
        self.aggregation_type = aggregation_type
        self.aliases = aliases or []
        self.usage_count = 0
        self.created_at = datetime.utcnow()

class ContextService:
    """Manages business context and AI embeddings"""
    
    def __init__(self):
        self.vector_db = PineconeClient()
        self.embedding_model = "text-embedding-ada-002"
    
    async def get_relevant_context(
        self,
        query: str,
        organization_id: str,
        project_id: Optional[str] = None,
        limit: int = 10
    ) -> List[ContextItem]:
        """Retrieve relevant business context for a query"""
        
        # Generate query embedding
        query_embedding = await self._generate_embedding(query)
        
        # Search vector database
        search_filter = {
            "organization_id": organization_id
        }
        if project_id:
            search_filter["project_id"] = project_id
        
        results = self.vector_db.query(
            vector=query_embedding,
            filter=search_filter,
            top_k=limit,
            include_metadata=True
        )
        
        return [
            ContextItem.from_pinecone_result(result)
            for result in results.matches
        ]
    
    async def update_embeddings(self, context: BusinessContext):
        """Update vector embeddings for business context"""
        embeddings_to_upsert = []
        
        # Generate embeddings for metrics
        for metric in context.metrics:
            embedding = await self._generate_embedding(
                f"{metric.name}: {metric.description} Formula: {metric.formula}"
            )
            
            embeddings_to_upsert.append({
                "id": f"metric_{context.organization_id}_{metric.name}",
                "values": embedding,
                "metadata": {
                    "type": "business_metric",
                    "organization_id": context.organization_id,
                    "project_id": context.project_id,
                    "name": metric.name,
                    "formula": metric.formula,
                    "description": metric.description
                }
            })
        
        # Generate embeddings for terminology
        for term, aliases in context.terminology.items():
            embedding = await self._generate_embedding(
                f"{term} also known as: {', '.join(aliases)}"
            )
            
            embeddings_to_upsert.append({
                "id": f"term_{context.organization_id}_{term}",
                "values": embedding,
                "metadata": {
                    "type": "terminology",
                    "organization_id": context.organization_id,
                    "project_id": context.project_id,
                    "term": term,
                    "aliases": aliases
                }
            })
        
        # Upsert embeddings to vector database
        if embeddings_to_upsert:
            self.vector_db.upsert(vectors=embeddings_to_upsert)
```

### 7.3.2. Context-Aware Prompt Engineering

```python
class PromptBuilder:
    """Builds context-aware prompts for AI operations"""
    
    def __init__(self, context_service: ContextService):
        self.context_service = context_service
    
    async def build_chart_generation_prompt(
        self,
        user_prompt: str,
        data_schema: DataSchema,
        business_context: BusinessContext
    ) -> str:
        """Build comprehensive prompt for chart generation"""
        
        # Get relevant context
        relevant_context = await self.context_service.get_relevant_context(
            user_prompt,
            business_context.organization_id,
            business_context.project_id
        )
        
        # Build system prompt
        system_prompt = f"""
You are an expert data analyst helping create visualizations for a {business_context.domain} business.

BUSINESS CONTEXT:
{self._format_business_context(relevant_context)}

DATA SCHEMA:
{self._format_data_schema(data_schema)}

INSTRUCTIONS:
1. Analyze the user's request and identify the most appropriate chart type
2. Select relevant columns from the provided schema
3. Apply business metrics and formulas where applicable
4. Consider aggregation requirements based on business context
5. Return a precise chart configuration

CHART TYPES AVAILABLE:
- bar: For categorical comparisons
- line: For trends over time
- pie: For part-to-whole relationships
- scatter: For correlations
- histogram: For distribution analysis
- heatmap: For correlation matrices

USER REQUEST: {user_prompt}

Generate a chart configuration that best answers this request using the available data.
"""
        
        return system_prompt
    
    def _format_business_context(self, context_items: List[ContextItem]) -> str:
        """Format business context for prompt inclusion"""
        context_text = ""
        
        metrics = [item for item in context_items if item.type == "business_metric"]
        if metrics:
            context_text += "Business Metrics:\n"
            for metric in metrics:
                context_text += f"- {metric.name}: {metric.description}\n"
                if metric.formula:
                    context_text += f"  Formula: {metric.formula}\n"
        
        terminology = [item for item in context_items if item.type == "terminology"]
        if terminology:
            context_text += "\nBusiness Terminology:\n"
            for term in terminology:
                aliases = ", ".join(term.aliases)
                context_text += f"- {term.term} (also: {aliases})\n"
        
        return context_text
    
    def _format_data_schema(self, schema: DataSchema) -> str:
        """Format data schema for prompt inclusion"""
        schema_text = "Available Columns:\n"
        
        for column in schema.columns:
            schema_text += f"- {column.name} ({column.type})"
            if column.description:
                schema_text += f": {column.description}"
            schema_text += "\n"
        
        return schema_text
```

## 7.4. AI-Powered Features Implementation

### 7.4.1. Chart Generation Service

```python
class ChartGenerationService:
    """AI-powered chart generation with business context"""
    
    def __init__(
        self,
        ai_service: AIServiceManager,
        context_service: ContextService,
        prompt_builder: PromptBuilder
    ):
        self.ai_service = ai_service
        self.context_service = context_service
        self.prompt_builder = prompt_builder
    
    async def generate_chart(
        self,
        request: ChartGenerationRequest
    ) -> ChartGenerationResponse:
        """Generate chart configuration from natural language"""
        
        # Load business context
        business_context = await self._load_business_context(
            request.organization_id,
            request.project_id
        )
        
        # Load data schema
        data_schema = await self._load_data_schema(request.data_source_id)
        
        # Build context-aware prompt
        system_prompt = await self.prompt_builder.build_chart_generation_prompt(
            request.prompt,
            data_schema,
            business_context
        )
        
        # Generate chart configuration
        try:
            chart_config = await self.ai_service.generate_with_fallback(
                "generate_chart_config",
                prompt=request.prompt,
                schema=data_schema,
                context=business_context,
                system_prompt=system_prompt
            )
            
            # Validate and enhance configuration
            validated_config = await self._validate_chart_config(
                chart_config,
                data_schema,
                business_context
            )
            
            # Generate SQL query
            sql_query = await self._generate_sql_query(
                validated_config,
                data_schema,
                business_context
            )
            
            return ChartGenerationResponse(
                chart_config=validated_config,
                sql_query=sql_query,
                explanation=f"Generated {validated_config.chart_type} chart showing {validated_config.title}",
                confidence_score=self._calculate_confidence_score(validated_config)
            )
            
        except Exception as e:
            # Log error and provide fallback
            logger.error(f"Chart generation failed: {str(e)}")
            return ChartGenerationResponse(
                error=f"Unable to generate chart: {str(e)}",
                suggestions=await self._generate_fallback_suggestions(
                    request.prompt,
                    data_schema
                )
            )
    
    async def _validate_chart_config(
        self,
        config: ChartConfig,
        schema: DataSchema,
        context: BusinessContext
    ) -> ChartConfig:
        """Validate and enhance chart configuration"""
        
        # Verify columns exist in schema
        available_columns = {col.name for col in schema.columns}
        
        if config.x_axis not in available_columns:
            raise ValidationError(f"Column '{config.x_axis}' not found in data")
        
        if config.y_axis not in available_columns:
            raise ValidationError(f"Column '{config.y_axis}' not found in data")
        
        # Apply business metric formulas
        for metric in context.metrics:
            if config.y_axis == metric.name:
                config.formula = metric.formula
                config.aggregation = metric.aggregation_type
                break
        
        # Set default aggregation if not specified
        if not config.aggregation:
            y_column = next(col for col in schema.columns if col.name == config.y_axis)
            config.aggregation = "sum" if y_column.type in ["integer", "float"] else "count"
        
        return config

class NarrativeGenerationService:
    """AI-powered narrative generation for visualizations"""
    
    async def generate_narrative(
        self,
        chart_data: dict,
        chart_config: ChartConfig,
        business_context: BusinessContext
    ) -> NarrativeResponse:
        """Generate data-driven narrative for visualization"""
        
        # Analyze data for key insights
        insights = self._analyze_chart_data(chart_data, chart_config)
        
        # Build narrative prompt with insights
        narrative_prompt = await self._build_narrative_prompt(
            insights,
            chart_config,
            business_context
        )
        
        # Generate narrative
        narrative = await self.ai_service.generate_with_fallback(
            "generate_narrative",
            chart_data=chart_data,
            context=business_context,
            prompt=narrative_prompt
        )
        
        # Add data links for transparency
        linked_narrative = self._add_data_links(narrative, insights)
        
        return NarrativeResponse(
            narrative=linked_narrative,
            key_insights=insights,
            confidence_score=self._calculate_narrative_confidence(narrative, insights)
        )
    
    def _analyze_chart_data(
        self,
        data: dict,
        config: ChartConfig
    ) -> List[DataInsight]:
        """Analyze chart data to extract key insights"""
        insights = []
        
        if config.chart_type == "bar":
            # Find highest and lowest values
            values = [point[config.y_axis] for point in data]
            max_value = max(values)
            min_value = min(values)
            
            max_item = next(point for point in data if point[config.y_axis] == max_value)
            min_item = next(point for point in data if point[config.y_axis] == min_value)
            
            insights.extend([
                DataInsight(
                    type="maximum",
                    value=max_value,
                    dimension=max_item[config.x_axis],
                    description=f"Highest {config.y_axis}: {max_value} for {max_item[config.x_axis]}"
                ),
                DataInsight(
                    type="minimum",
                    value=min_value,
                    dimension=min_item[config.x_axis],
                    description=f"Lowest {config.y_axis}: {min_value} for {min_item[config.x_axis]}"
                )
            ])
            
            # Calculate percentage differences
            if len(values) > 1:
                avg_value = sum(values) / len(values)
                for point in data:
                    value = point[config.y_axis]
                    pct_diff = ((value - avg_value) / avg_value) * 100
                    
                    if abs(pct_diff) > 20:  # Significant deviation
                        insights.append(DataInsight(
                            type="deviation",
                            value=value,
                            dimension=point[config.x_axis],
                            percentage=pct_diff,
                            description=f"{point[config.x_axis]} is {abs(pct_diff):.1f}% {'above' if pct_diff > 0 else 'below'} average"
                        ))
        
        return insights[:5]  # Limit to top 5 insights
```

### 7.4.2. Query Generation and Optimization

```python
class QueryGenerationService:
    """AI-powered SQL query generation and optimization"""
    
    async def generate_sql_query(
        self,
        natural_language_query: str,
        data_source: DataSource,
        business_context: BusinessContext
    ) -> QueryGenerationResponse:
        """Generate SQL query from natural language description"""
        
        # Build comprehensive prompt for SQL generation
        sql_prompt = await self._build_sql_generation_prompt(
            natural_language_query,
            data_source.schema,
            business_context
        )
        
        # Generate SQL using AI
        sql_query = await self.ai_service.generate_with_fallback(
            "generate_sql_query",
            prompt=natural_language_query,
            schema=data_source.schema,
            context=business_context,
            system_prompt=sql_prompt
        )
        
        # Validate SQL syntax
        validated_query = await self._validate_sql_query(
            sql_query,
            data_source.connection_type
        )
        
        # Optimize query performance
        optimized_query = await self._optimize_query(
            validated_query,
            data_source
        )
        
        return QueryGenerationResponse(
            sql_query=optimized_query,
            explanation=await self._explain_query(optimized_query),
            estimated_cost=await self._estimate_query_cost(optimized_query, data_source)
        )
    
    async def _build_sql_generation_prompt(
        self,
        query: str,
        schema: DataSchema,
        context: BusinessContext
    ) -> str:
        """Build comprehensive SQL generation prompt"""
        
        prompt = f"""
You are an expert SQL analyst. Generate a precise SQL query based on the user request.

DATABASE SCHEMA:
{self._format_schema_for_sql(schema)}

BUSINESS CONTEXT:
{self._format_business_metrics_for_sql(context.metrics)}

SQL BEST PRACTICES:
1. Use proper JOINs when accessing multiple tables
2. Apply appropriate WHERE clauses for filtering
3. Use correct aggregation functions (SUM, COUNT, AVG)
4. Include proper GROUP BY clauses
5. Order results logically
6. Use LIMIT for large result sets
7. Apply business metric formulas when relevant

USER REQUEST: {query}

Generate a SQL query that accurately answers this request.
Return only the SQL query without additional explanation.
"""
        
        return prompt
    
    async def _validate_sql_query(
        self,
        query: str,
        database_type: str
    ) -> str:
        """Validate SQL query syntax for specific database type"""
        
        try:
            # Use sqlparse for basic syntax validation
            parsed = sqlparse.parse(query)[0]
            
            # Database-specific validation
            if database_type == "postgresql":
                return self._validate_postgresql_query(query)
            elif database_type == "mysql":
                return self._validate_mysql_query(query)
            elif database_type == "snowflake":
                return self._validate_snowflake_query(query)
            
            return query
            
        except Exception as e:
            raise QueryValidationError(f"Invalid SQL syntax: {str(e)}")
    
    async def _optimize_query(
        self,
        query: str,
        data_source: DataSource
    ) -> str:
        """Optimize SQL query for performance"""
        
        # Apply database-specific optimizations
        optimizations = []
        
        # Add LIMIT if not present and result set might be large
        if "LIMIT" not in query.upper() and "COUNT" not in query.upper():
            optimizations.append("Add LIMIT 1000 for initial results")
            query += " LIMIT 1000"
        
        # Suggest indexes if available
        if hasattr(data_source, 'suggested_indexes'):
            for index in data_source.suggested_indexes:
                if any(col in query for col in index.columns):
                    optimizations.append(f"Using index on {', '.join(index.columns)}")
        
        return query
```

## 7.5. AI Quality Assurance and Monitoring

### 7.5.1. Response Quality Validation

```python
class AIQualityValidator:
    """Validates AI response quality and accuracy"""
    
    def __init__(self):
        self.accuracy_threshold = 0.85
        self.confidence_threshold = 0.7
    
    async def validate_chart_generation(
        self,
        request: ChartGenerationRequest,
        response: ChartGenerationResponse
    ) -> ValidationResult:
        """Validate chart generation quality"""
        
        validations = []
        
        # Check if chart type matches intent
        chart_type_score = await self._validate_chart_type_selection(
            request.prompt,
            response.chart_config.chart_type
        )
        validations.append(("chart_type", chart_type_score))
        
        # Validate column selection
        column_score = await self._validate_column_selection(
            request.prompt,
            response.chart_config
        )
        validations.append(("column_selection", column_score))
        
        # Check business context application
        context_score = await self._validate_context_application(
            request,
            response
        )
        validations.append(("context_application", context_score))
        
        # Calculate overall score
        overall_score = sum(score for _, score in validations) / len(validations)
        
        return ValidationResult(
            overall_score=overall_score,
            individual_scores=dict(validations),
            passed=overall_score >= self.accuracy_threshold,
            recommendations=self._generate_improvement_recommendations(validations)
        )
    
    async def validate_narrative_quality(
        self,
        chart_data: dict,
        narrative: str
    ) -> NarrativeValidationResult:
        """Validate narrative quality and factual accuracy"""
        
        # Check factual accuracy
        factual_accuracy = self._check_factual_accuracy(chart_data, narrative)
        
        # Check readability
        readability_score = self._calculate_readability_score(narrative)
        
        # Check completeness
        completeness_score = self._check_narrative_completeness(chart_data, narrative)
        
        # Check for hallucinations
        hallucination_score = self._check_for_hallucinations(chart_data, narrative)
        
        overall_score = (
            factual_accuracy * 0.4 +
            readability_score * 0.2 +
            completeness_score * 0.2 +
            hallucination_score * 0.2
        )
        
        return NarrativeValidationResult(
            overall_score=overall_score,
            factual_accuracy=factual_accuracy,
            readability=readability_score,
            completeness=completeness_score,
            hallucination_check=hallucination_score,
            passed=overall_score >= self.accuracy_threshold
        )

class AIUsageMonitor:
    """Monitors AI usage, costs, and performance metrics"""
    
    def __init__(self):
        self.metrics_client = MetricsClient()
    
    async def track_ai_request(
        self,
        provider: str,
        operation: str,
        request_data: dict,
        response_data: dict,
        duration: float,
        success: bool,
        cost: float = None
    ):
        """Track AI request metrics"""
        
        # Record basic metrics
        self.metrics_client.increment(
            "ai.requests.total",
            tags={
                "provider": provider,
                "operation": operation,
                "success": success
            }
        )
        
        self.metrics_client.histogram(
            "ai.request.duration",
            duration,
            tags={
                "provider": provider,
                "operation": operation
            }
        )
        
        if cost:
            self.metrics_client.histogram(
                "ai.request.cost",
                cost,
                tags={"provider": provider}
            )
        
        # Track token usage
        if "input_tokens" in response_data:
            self.metrics_client.histogram(
                "ai.tokens.input",
                response_data["input_tokens"],
                tags={"provider": provider}
            )
        
        if "output_tokens" in response_data:
            self.metrics_client.histogram(
                "ai.tokens.output",
                response_data["output_tokens"],
                tags={"provider": provider}
            )
        
        # Store detailed usage data
        await self._store_usage_record(
            provider=provider,
            operation=operation,
            request_data=request_data,
            response_data=response_data,
            duration=duration,
            success=success,
            cost=cost,
            timestamp=datetime.utcnow()
        )
    
    async def get_usage_analytics(
        self,
        organization_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> AIUsageAnalytics:
        """Get AI usage analytics for organization"""
        
        usage_data = await self._query_usage_data(
            organization_id,
            start_date,
            end_date
        )
        
        return AIUsageAnalytics(
            total_requests=len(usage_data),
            total_cost=sum(record.cost or 0 for record in usage_data),
            average_response_time=sum(record.duration for record in usage_data) / len(usage_data),
            success_rate=sum(1 for record in usage_data if record.success) / len(usage_data),
            most_used_operations=self._calculate_operation_usage(usage_data),
            cost_by_provider=self._calculate_cost_by_provider(usage_data),
            trends=self._calculate_usage_trends(usage_data)
        )
```

### 7.5.2. Feedback Learning System

```python
class AIFeedbackSystem:
    """Collects and processes user feedback to improve AI performance"""
    
    def __init__(self):
        self.feedback_store = FeedbackStore()
        self.model_trainer = ModelTrainer()
    
    async def collect_feedback(
        self,
        user_id: str,
        request_id: str,
        feedback_type: str,
        rating: int,
        comments: str = None,
        corrections: dict = None
    ):
        """Collect user feedback on AI responses"""
        
        feedback = AIFeedback(
            user_id=user_id,
            request_id=request_id,
            feedback_type=feedback_type,
            rating=rating,
            comments=comments,
            corrections=corrections,
            timestamp=datetime.utcnow()
        )
        
        await self.feedback_store.store_feedback(feedback)
        
        # Trigger immediate learning if high-confidence correction
        if corrections and rating <= 2:
            await self._process_immediate_learning(feedback)
    
    async def process_feedback_batch(self, batch_size: int = 100):
        """Process batch of feedback for model improvement"""
        
        unprocessed_feedback = await self.feedback_store.get_unprocessed_feedback(
            limit=batch_size
        )
        
        if not unprocessed_feedback:
            return
        
        # Analyze feedback patterns
        patterns = self._analyze_feedback_patterns(unprocessed_feedback)
        
        # Generate training examples
        training_examples = []
        for feedback in unprocessed_feedback:
            if feedback.corrections:
                training_example = self._create_training_example(feedback)
                training_examples.append(training_example)
        
        # Update fine-tuning dataset
        if training_examples:
            await self.model_trainer.add_training_examples(training_examples)
        
        # Mark feedback as processed
        await self.feedback_store.mark_processed(
            [f.id for f in unprocessed_feedback]
        )
    
    def _analyze_feedback_patterns(
        self,
        feedback_list: List[AIFeedback]
    ) -> FeedbackPatterns:
        """Analyze patterns in user feedback"""
        
        patterns = FeedbackPatterns()
        
        # Group by operation type
        by_operation = {}
        for feedback in feedback_list:
            op_type = feedback.request_metadata.get("operation", "unknown")
            if op_type not in by_operation:
                by_operation[op_type] = []
            by_operation[op_type].append(feedback)
        
        # Calculate average ratings by operation
        for operation, feedbacks in by_operation.items():
            avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
            patterns.operation_ratings[operation] = avg_rating
        
        # Identify common issues
        negative_feedback = [f for f in feedback_list if f.rating <= 2]
        patterns.common_issues = self._extract_common_issues(negative_feedback)
        
        return patterns
```

## 7.6. Security and Privacy

### 7.6.1. Data Privacy Protection

```yaml
privacy_controls:
  data_minimization:
    - Only send necessary data to AI providers
    - Implement field-level redaction for PII
    - Use data sampling for large datasets
    
  encryption:
    - TLS 1.3 for data in transit
    - AES-256 encryption for data at rest
    - End-to-end encryption for sensitive operations
    
  access_controls:
    - Role-based access to AI features
    - Audit logging for all AI interactions
    - IP allowlisting for API access
    
  data_residency:
    - Regional data processing options
    - EU data stays in EU (GDPR compliance)
    - On-premises deployment for sensitive data
```

### 7.6.2. AI Security Implementation

```python
class AISecurityManager:
    """Manages security aspects of AI interactions"""
    
    def __init__(self):
        self.pii_detector = PIIDetector()
        self.data_classifier = DataClassifier()
    
    async def sanitize_request(
        self,
        request_data: dict,
        user_context: UserContext
    ) -> dict:
        """Sanitize AI request data for security"""
        
        sanitized_data = request_data.copy()
        
        # Detect and redact PII
        if "data_sample" in sanitized_data:
            sanitized_data["data_sample"] = await self.pii_detector.redact_pii(
                sanitized_data["data_sample"],
                redaction_level=user_context.organization.pii_policy
            )
        
        # Classify data sensitivity
        sensitivity_level = await self.data_classifier.classify(sanitized_data)
        
        # Apply security controls based on sensitivity
        if sensitivity_level == "restricted":
            # Use on-premises AI model
            sanitized_data["_use_local_model"] = True
        elif sensitivity_level == "confidential":
            # Use private cloud deployment
            sanitized_data["_use_private_deployment"] = True
        
        return sanitized_data
    
    async def validate_ai_response(
        self,
        response: dict,
        original_request: dict
    ) -> dict:
        """Validate AI response for security issues"""
        
        # Check for data leakage
        if self._contains_sensitive_data(response):
            logger.warning("AI response contains sensitive data")
            response = self._sanitize_response(response)
        
        # Validate against prompt injection
        if self._contains_prompt_injection(response):
            logger.warning("Potential prompt injection detected")
            raise SecurityError("Response failed security validation")
        
        return response
    
    def _contains_sensitive_data(self, response: dict) -> bool:
        """Check if response contains sensitive data"""
        response_text = str(response)
        
        # Check for common PII patterns
        pii_patterns = [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email
        ]
        
        for pattern in pii_patterns:
            if re.search(pattern, response_text):
                return True
        
        return False
```

## 7.7. Performance Optimization

### 7.7.1. Caching Strategy

```python
class AIResponseCache:
    """Intelligent caching for AI responses"""
    
    def __init__(self):
        self.redis_client = redis.Redis()
        self.cache_ttl = {
            "chart_generation": 3600,  # 1 hour
            "narrative_generation": 1800,  # 30 minutes
            "query_generation": 2400,  # 40 minutes
        }
    
    async def get_cached_response(
        self,
        operation: str,
        request_hash: str
    ) -> Optional[dict]:
        """Get cached AI response if available"""
        
        cache_key = f"ai:{operation}:{request_hash}"
        cached_data = await self.redis_client.get(cache_key)
        
        if cached_data:
            # Update cache access metrics
            await self._track_cache_hit(operation)
            return json.loads(cached_data)
        
        await self._track_cache_miss(operation)
        return None
    
    async def cache_response(
        self,
        operation: str,
        request_hash: str,
        response: dict
    ):
        """Cache AI response with appropriate TTL"""
        
        cache_key = f"ai:{operation}:{request_hash}"
        ttl = self.cache_ttl.get(operation, 1800)
        
        await self.redis_client.setex(
            cache_key,
            ttl,
            json.dumps(response)
        )
    
    def generate_request_hash(self, request_data: dict) -> str:
        """Generate hash for request caching"""
        
        # Remove non-deterministic fields
        cache_data = {
            k: v for k, v in request_data.items()
            if k not in ["request_id", "timestamp", "user_id"]
        }
        
        # Sort for consistent hashing
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.sha256(cache_string.encode()).hexdigest()
```

### 7.7.2. Request Batching and Optimization

```python
class AIRequestBatcher:
    """Batches AI requests for improved efficiency"""
    
    def __init__(self):
        self.batch_queue = asyncio.Queue()
        self.batch_size = 10
        self.batch_timeout = 0.5  # 500ms
        self.processing_task = None
    
    async def submit_request(
        self,
        operation: str,
        request_data: dict
    ) -> dict:
        """Submit AI request for batching"""
        
        request_id = str(uuid.uuid4())
        future = asyncio.Future()
        
        batch_item = BatchItem(
            id=request_id,
            operation=operation,
            data=request_data,
            future=future,
            submitted_at=time.time()
        )
        
        await self.batch_queue.put(batch_item)
        
        # Start processing task if not running
        if not self.processing_task or self.processing_task.done():
            self.processing_task = asyncio.create_task(self._process_batches())
        
        return await future
    
    async def _process_batches(self):
        """Process batched AI requests"""
        
        while True:
            batch = []
            batch_start = time.time()
            
            # Collect requests for batch
            try:
                # Get first item (blocking)
                first_item = await asyncio.wait_for(
                    self.batch_queue.get(),
                    timeout=1.0
                )
                batch.append(first_item)
                
                # Collect additional items until batch full or timeout
                while (
                    len(batch) < self.batch_size and
                    (time.time() - batch_start) < self.batch_timeout
                ):
                    try:
                        item = await asyncio.wait_for(
                            self.batch_queue.get(),
                            timeout=0.1
                        )
                        batch.append(item)
                    except asyncio.TimeoutError:
                        break
                
                # Process batch
                if batch:
                    await self._execute_batch(batch)
                    
            except asyncio.TimeoutError:
                # No requests in queue, exit processing
                break
    
    async def _execute_batch(self, batch: List[BatchItem]):
        """Execute batch of AI requests"""
        
        # Group by operation type
        by_operation = {}
        for item in batch:
            if item.operation not in by_operation:
                by_operation[item.operation] = []
            by_operation[item.operation].append(item)
        
        # Process each operation type
        for operation, items in by_operation.items():
            try:
                if operation == "chart_generation" and len(items) > 1:
                    results = await self._batch_chart_generation(items)
                else:
                    # Process individually for operations without batch support
                    results = await self._process_individual_requests(items)
                
                # Set results on futures
                for item, result in zip(items, results):
                    item.future.set_result(result)
                    
            except Exception as e:
                # Set exception on all futures in batch
                for item in items:
                    item.future.set_exception(e)
```

## 7.8. Cost Management and Optimization

### 7.8.1. Cost Tracking and Analysis

```python
class AICostManager:
    """Manages AI costs and optimization strategies"""
    
    def __init__(self):
        self.cost_tracker = CostTracker()
        self.usage_optimizer = UsageOptimizer()
    
    async def track_request_cost(
        self,
        request: AIRequest,
        response: AIResponse,
        provider: str,
        model: str
    ):
        """Track cost for individual AI request"""
        
        cost_data = CostData(
            request_id=request.id,
            organization_id=request.organization_id,
            user_id=request.user_id,
            operation=request.operation,
            provider=provider,
            model=model,
            input_tokens=response.input_tokens,
            output_tokens=response.output_tokens,
            total_cost=response.cost,
            timestamp=datetime.utcnow()
        )
        
        await self.cost_tracker.record_cost(cost_data)
        
        # Check budget limits
        await self._check_budget_limits(request.organization_id)
    
    async def get_cost_analytics(
        self,
        organization_id: str,
        period: str = "monthly"
    ) -> CostAnalytics:
        """Get comprehensive cost analytics"""
        
        cost_data = await self.cost_tracker.get_costs(
            organization_id=organization_id,
            period=period
        )
        
        return CostAnalytics(
            total_cost=sum(c.total_cost for c in cost_data),
            cost_by_operation=self._group_costs_by_operation(cost_data),
            cost_by_provider=self._group_costs_by_provider(cost_data),
            cost_trends=self._calculate_cost_trends(cost_data),
            optimization_suggestions=await self._generate_optimization_suggestions(cost_data)
        )
    
    async def _generate_optimization_suggestions(
        self,
        cost_data: List[CostData]
    ) -> List[OptimizationSuggestion]:
        """Generate cost optimization suggestions"""
        
        suggestions = []
        
        # Analyze high-cost operations
        operation_costs = self._group_costs_by_operation(cost_data)
        high_cost_ops = sorted(operation_costs.items(), key=lambda x: x[1], reverse=True)[:3]
        
        for operation, cost in high_cost_ops:
            if cost > 100:  # Threshold for expensive operations
                suggestions.append(OptimizationSuggestion(
                    type="operation_optimization",
                    operation=operation,
                    current_cost=cost,
                    potential_savings=cost * 0.2,  # Estimate 20% savings
                    recommendation=f"Consider using caching or simpler models for {operation}"
                ))
        
        # Analyze provider efficiency
        provider_efficiency = await self._analyze_provider_efficiency(cost_data)
        for suggestion in provider_efficiency:
            suggestions.append(suggestion)
        
        return suggestions
```

### 7.8.2. Model Selection Optimization

```python
class ModelSelector:
    """Selects optimal AI model based on requirements and cost"""
    
    def __init__(self):
        self.model_performance = ModelPerformanceDB()
        self.cost_calculator = CostCalculator()
    
    async def select_optimal_model(
        self,
        request: AIRequest,
        constraints: ModelConstraints = None
    ) -> ModelSelection:
        """Select the most cost-effective model for the request"""
        
        # Get available models for operation
        available_models = await self._get_available_models(request.operation)
        
        # Filter by constraints
        if constraints:
            available_models = self._filter_by_constraints(available_models, constraints)
        
        # Score models based on multiple factors
        model_scores = []
        for model in available_models:
            score = await self._score_model(model, request)
            model_scores.append((model, score))
        
        # Select highest scoring model
        best_model, best_score = max(model_scores, key=lambda x: x[1])
        
        return ModelSelection(
            provider=best_model.provider,
            model=best_model.name,
            estimated_cost=await self._estimate_cost(best_model, request),
            confidence_score=best_score.confidence,
            reasoning=best_score.reasoning
        )
    
    async def _score_model(
        self,
        model: AIModel,
        request: AIRequest
    ) -> ModelScore:
        """Score a model based on performance, cost, and suitability"""
        
        # Get historical performance
        performance = await self.model_performance.get_performance(
            model.name,
            request.operation
        )
        
        # Calculate cost efficiency
        estimated_cost = await self._estimate_cost(model, request)
        cost_score = 1.0 / (estimated_cost + 1.0)  # Inverse cost scoring
        
        # Weight factors
        weights = {
            "accuracy": 0.4,
            "speed": 0.3,
            "cost": 0.3
        }
        
        composite_score = (
            performance.accuracy * weights["accuracy"] +
            performance.speed_score * weights["speed"] +
            cost_score * weights["cost"]
        )
        
        return ModelScore(
            confidence=composite_score,
            accuracy=performance.accuracy,
            speed=performance.speed_score,
            cost_efficiency=cost_score,
            reasoning=f"Selected based on {composite_score:.2f} composite score"
        )
```

This comprehensive AI/LLM integration specification provides the foundation for Jabiru's intelligent capabilities while maintaining security, performance, and transparency standards. The modular architecture allows for easy scaling and adaptation as AI technologies evolve.